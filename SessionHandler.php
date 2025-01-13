<?php

namespace Aws\DynamoDb;

use SessionHandlerInterface;

/**
 * Custom session handler for storing sessions in DynamoDB.
 */
class SessionHandler implements SessionHandlerInterface
{
    /** @var SessionConnectionInterface Handles session save logic. */
    private $connection;

    /** @var string Session save path. */
    private $savePath;

    /** @var string Session name. */
    private $sessionName;

    /** @var string Tracks the currently open session ID. */
    private $openSessionId = '';

    /** @var string Stores serialized session data to track changes. */
    private $dataRead = '';

    /** @var bool Tracks whether the session has been written. */
    private $sessionWritten = false;

    /**
     * Creates a new DynamoDB Session Handler instance.
     *
     * @param DynamoDbClient $client DynamoDB client for performing operations.
     * @param array          $config Configuration options.
     *
     * @return SessionHandler
     */
    public static function fromClient(DynamoDbClient $client, array $config = []): self
    {
        $config += ['locking' => false];
        $connection = $config['locking']
            ? new LockingSessionConnection($client, $config)
            : new StandardSessionConnection($client, $config);

        return new self($connection);
    }

    /**
     * Constructor to initialize session handler with a connection.
     *
     * @param SessionConnectionInterface $connection Handles session operations.
     */
    public function __construct(SessionConnectionInterface $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Registers the custom session handler.
     *
     * @return bool True if registered successfully.
     */
    public function register(): bool
    {
        return session_set_save_handler($this, true);
    }

    /**
     * Opens a session.
     *
     * @param string $savePath    Session save path.
     * @param string $sessionName Session name.
     *
     * @return bool True on success.
     */
    #[\ReturnTypeWillChange]
    public function open($savePath, $sessionName)
    {
        $this->savePath = $savePath;
        $this->sessionName = $sessionName;

        return true;
    }

    /**
     * Closes a session.
     *
     * @return bool True on success.
     */
    #[\ReturnTypeWillChange]
    public function close()
    {
        $id = session_id();

        // Ensure session expiration time is updated even if no write occurred.
        if ($this->openSessionId !== $id || !$this->sessionWritten) {
            $result = $this->connection->write($this->formatId($id), '', false);
            $this->sessionWritten = (bool) $result;
        }

        return $this->sessionWritten;
    }

    /**
     * Reads session data from DynamoDB.
     *
     * @param string $id Session ID.
     *
     * @return string Session data or an empty string if not found.
     */
    #[\ReturnTypeWillChange]
    public function read($id)
    {
        $this->openSessionId = $id;
        $this->dataRead = '';

        // Fetch session data from DynamoDB.
        $item = $this->connection->read($this->formatId($id));
        $dataAttribute = $this->connection->getDataAttribute();
        $lifetimeAttribute = $this->connection->getSessionLifetimeAttribute();

        // Verify expiration and return data if valid.
        if (isset($item[$lifetimeAttribute], $item[$dataAttribute])) {
            if ($item[$lifetimeAttribute] > time()) {
                $this->dataRead = $item[$dataAttribute];
            } else {
                $this->destroy($id);
            }
        }

        return $this->dataRead;
    }

    /**
     * Writes session data to DynamoDB.
     *
     * @param string $id   Session ID.
     * @param string $data Serialized session data.
     *
     * @return bool True on success.
     */
    #[\ReturnTypeWillChange]
    public function write($id, $data)
    {
        $changed = $id !== $this->openSessionId || $data !== $this->dataRead;
        $this->openSessionId = $id;

        // Save session data.
        $this->sessionWritten = $this->connection->write($this->formatId($id), $data, $changed);

        return $this->sessionWritten;
    }

    /**
     * Deletes a session from DynamoDB.
     *
     * @param string $id Session ID.
     *
     * @return bool True on success.
     */
    #[\ReturnTypeWillChange]
    public function destroy($id)
    {
        $this->openSessionId = $id;
        $this->sessionWritten = $this->connection->delete($this->formatId($id));

        return $this->sessionWritten;
    }

    /**
     * Garbage collection placeholder (no-op for DynamoDB).
     *
     * @param int $maxLifetime Unused parameter.
     *
     * @return bool True.
     */
    #[\ReturnTypeWillChange]
    public function gc($maxLifetime)
    {
        // Garbage collection must be triggered manually via garbageCollect().
        return true;
    }

    /**
     * Manually triggers garbage collection on expired sessions.
     *
     * @return void
     */
    public function garbageCollect()
    {
        $this->connection->deleteExpired();
    }

    /**
     * Formats the session ID with the session name as a prefix.
     *
     * @param string $id Session ID.
     *
     * @return string Formatted session ID.
     */
    private function formatId($id): string
    {
        return trim("{$this->sessionName}_{$id}", '_');
    }
}