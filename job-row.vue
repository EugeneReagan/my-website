<template>
    <tr>
        <!-- Job Name and Queue Information -->
        <td>
            <router-link
                :title="job.name"
                :to="{ name: `${$route.params.type}-jobs-preview`, params: { jobId: job.id } }"
            >
                {{ jobBaseName(job.name) }}
            </router-link>

            <!-- Delayed Badge -->
            <small
                class="ml-1 badge badge-secondary badge-sm"
                v-tooltip:top="`Delayed for ${delayed}`"
                v-if="delayed && (job.status === 'reserved' || job.status === 'pending')"
            >
                Delayed
            </small>

            <br>

            <!-- Queue and Tags -->
            <small class="text-muted">
                Queue: {{ job.queue }}

                <span v-if="job.payload.tags?.length" class="text-break">
                    | Tags: {{ displayTags }}
                    <span v-if="job.payload.tags.length > 3">
                        ({{ job.payload.tags.length - 3 }} more)
                    </span>
                </span>
            </small>
        </td>

        <!-- Pushed At -->
        <td class="table-fit text-muted">
            {{ readableTimestamp(job.payload.pushedAt) }}
        </td>

        <!-- Completed At (For Completed/Silenced Jobs) -->
        <td
            v-if="$route.params.type === 'completed' || $route.params.type === 'silenced'"
            class="table-fit text-muted"
        >
            {{ readableTimestamp(job.completed_at) }}
        </td>

        <!-- Runtime (For Completed/Silenced Jobs) -->
        <td
            v-if="$route.params.type === 'completed' || $route.params.type === 'silenced'"
            class="table-fit text-right text-muted"
        >
            <span>
                {{ job.completed_at ? calculateRuntime(job.completed_at, job.reserved_at) : '-' }}
            </span>
        </td>
    </tr>
</template>

<script>
import phpunserialize from 'phpunserialize';
import moment from 'moment-timezone';

export default {
    props: {
        job: {
            type: Object,
            required: true, // Ensure the `job` object is always provided
        },
    },

    computed: {
        /**
         * Attempt to unserialize the job's payload data.
         * Returns null if deserialization fails.
         */
        unserialized() {
            try {
                return phpunserialize(this.job.payload.data.command);
            } catch (error) {
                console.error("Failed to unserialize payload data:", error);
                return null;
            }
        },

        /**
         * Calculate delay time from job data.
         * Returns a human-readable time string or null if not delayed.
         */
        delayed() {
            if (this.unserialized?.delay?.date && this.unserialized?.delay?.timezone) {
                return moment
                    .tz(this.unserialized.delay.date, this.unserialized.delay.timezone)
                    .fromNow(true);
            } else if (this.unserialized?.delay) {
                return moment(this.job.payload.pushedAt)
                    .add(this.unserialized.delay, 'seconds')
                    .fromNow(true);
            }
            return null;
        },

        /**
         * Display the first three tags and indicate if there are more.
         */
        displayTags() {
            const tags = this.job.payload.tags || [];
            return tags.slice(0, 3).join(', ');
        },
    },

    methods: {
        /**
         * Extract the base name from the job's full name.
         * @param {String} name
         * @returns {String}
         */
        jobBaseName(name) {
            return name.split('\\').pop();
        },

        /**
         * Format timestamps into a human-readable format.
         * @param {Number} timestamp
         * @returns {String}
         */
        readableTimestamp(timestamp) {
            return timestamp
                ? moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
                : '-';
        },

        /**
         * Calculate the runtime of a job in seconds and format it.
         * @param {Number} completedAt
         * @param {Number} reservedAt
         * @returns {String}
         */
        calculateRuntime(completedAt, reservedAt) {
            const runtime = completedAt - reservedAt;
            return `${runtime.toFixed(2)}s`;
        },
    },
};
</script>