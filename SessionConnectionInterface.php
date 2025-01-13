<?php

namespace Aws\DynamoDb;

/**
 * The `SessionConnectionInterface` defines the contract for interacting with
 * Amazon DynamoDB for session storage. Implementations of this interface
 * handle the underlying logic for reading, writing, and deleting session data.
 */
interface SessionConnectionInterface
{
    /**
     * Reads session data from DynamoDB.
     *
     * @param string $id The session ID.
     *
     * @return array An associative array representing the session record.
     *               Example:
     *               [
     *                   'data' => 'serialized_session_data',
     *                   'expires' => 1678901234, // Unix timestamp
     *                   ...
     *               ]
     */
    public function read(string $id): array;

    /**
     * Writes session data to DynamoDB.
     *
     * @param string $id        The session ID.
     * @param string $data      The serialized session data.
     * @param bool   $isChanged Whether the data has changed since the last write.
     *
     * @return bool Returns true if the session was successfully written, false otherwise.
     */
    public function write(string $id, string $data, bool $isChanged): bool;

    /**
     * Deletes a session record from DynamoDB.
     *
     * @param string $id The session ID to delete.
     *
     * @return bool Returns true if the session was successfully deleted, false otherwise.
     */
    public function delete(string $id): bool;

    /**
     * Performs garbage collection by deleting expired session records from DynamoDB.
     *
     * @return bool Returns true if the operation succeeded, false otherwise.
     */
    public function deleteExpired(): bool;
}