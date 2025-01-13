<script>
import moment from 'moment';

export default {
    data() {
        return {
            stats: {}, // Holds stats data
            workers: [], // Holds worker stats
            workload: [], // Holds workload data
            ready: false, // Indicates if data is fully loaded
            timeout: null, // Timeout reference for periodic refresh
        };
    },

    /**
     * Lifecycle hooks
     */
    mounted() {
        document.title = "Horizon - Dashboard";

        // Start refreshing stats periodically
        this.refreshStatsPeriodically();
    },

    beforeUnmount() {
        // Cleanup the timeout to prevent memory leaks
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    },

    computed: {
        /**
         * Label for recent jobs period.
         */
        recentJobsPeriod() {
            return !this.ready
                ? 'Jobs Past Hour'
                : `Jobs Past ${this.determinePeriod(this.stats.periods?.recentJobs)}`;
        },

        /**
         * Label for recently failed jobs period.
         */
        failedJobsPeriod() {
            return !this.ready
                ? 'Failed Jobs Past 7 Days'
                : `Failed Jobs Past ${this.determinePeriod(this.stats.periods?.failedJobs)}`;
        },
    },

    methods: {
        /**
         * Load the general stats.
         */
        async loadStats() {
            try {
                const response = await this.$http.get(`${Horizon.basePath}/api/stats`);
                this.stats = response.data;

                // Determine max wait time and queue
                if (response.data.wait && Object.values(response.data.wait)[0]) {
                    this.stats.max_wait_time = Object.values(response.data.wait)[0];
                    this.stats.max_wait_queue = Object.keys(response.data.wait)[0].split(':')[1];
                }
            } catch (error) {
                console.error("Failed to load stats:", error);
                // Handle the error (e.g., show an error message or retry mechanism)
            }
        },

        /**
         * Load the workers stats.
         */
        async loadWorkers() {
            try {
                const response = await this.$http.get(`${Horizon.basePath}/api/masters`);
                this.workers = response.data;
            } catch (error) {
                console.error("Failed to load workers:", error);
            }
        },

        /**
         * Load the workload stats.
         */
        async loadWorkload() {
            try {
                const response = await this.$http.get(`${Horizon.basePath}/api/workload`);
                this.workload = response.data;
            } catch (error) {
                console.error("Failed to load workload:", error);
            }
        },

        /**
         * Refresh stats periodically with error handling.
         */
        async refreshStatsPeriodically() {
            try {
                // Load stats, workers, and workload concurrently
                await Promise.all([this.loadStats(), this.loadWorkers(), this.loadWorkload()]);

                // Mark data as ready once everything is loaded
                this.ready = true;

                // Schedule the next refresh
                this.timeout = setTimeout(() => {
                    this.refreshStatsPeriodically();
                }, 5000);
            } catch (error) {
                console.error("Error during stats refresh:", error);

                // Retry after a delay even if there's an error
                this.timeout = setTimeout(() => {
                    this.refreshStatsPeriodically();
                }, 5000);
            }
        },

        /**
         * Count processes for the given supervisor.
         */
        countProcesses(processes) {
            return Object.values(processes).reduce((total, value) => total + value, 0).toLocaleString();
        },

        /**
         * Format the Supervisor display name.
         */
        superVisorDisplayName(supervisor, worker) {
            return supervisor.replace(`${worker}:`, '');
        },

        /**
         * Format time into a human-readable format.
         */
        humanTime(time) {
            return moment
                .duration(time, "seconds")
                .humanize()
                .replace(/^(.)/g, (match) => match.toUpperCase());
        },

        /**
         * Determine the unit for the given timeframe.
         */
        determinePeriod(minutes) {
            return moment
                .duration(moment().diff(moment().subtract(minutes, "minutes")))
                .humanize()
                .replace(/^An?\s/i, '')
                .replace(/^(.)|\s(.)/g, (match) => match.toUpperCase());
        },
    },
};
</script>

<template>
    <div>
        <!-- Overview Card -->
        <div class="card overflow-hidden">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">Overview</h2>
            </div>
            <div class="card-bg-secondary">
                <div class="d-flex">
                    <!-- Jobs Per Minute -->
                    <div class="w-25 p-4">
                        <small class="text-muted font-weight-bold">Jobs Per Minute</small>
                        <p class="h4 mt-2 mb-0">
                            {{ stats.jobsPerMinute ? stats.jobsPerMinute.toLocaleString() : 0 }}
                        </p>
                    </div>
                    <!-- Recent Jobs -->
                    <div class="w-25 p-4">
                        <small class="text-muted font-weight-bold">{{ recentJobsPeriod }}</small>
                        <p class="h4 mt-2 mb-0">
                            {{ stats.recentJobs ? stats.recentJobs.toLocaleString() : 0 }}
                        </p>
                    </div>
                    <!-- Failed Jobs -->
                    <div class="w-25 p-4">
                        <small class="text-muted font-weight-bold">{{ failedJobsPeriod }}</small>
                        <p class="h4 mt-2 mb-0">
                            {{ stats.failedJobs ? stats.failedJobs.toLocaleString() : 0 }}
                        </p>
                    </div>
                    <!-- Status -->
                    <div class="w-25 p-4">
                        <small class="text-muted font-weight-bold">Status</small>
                        <div class="d-flex align-items-center mt-2">
                            <svg
                                v-if="stats.status === 'running'"
                                class="text-success"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                style="width: 1.5rem; height: 1.5rem;"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p class="h4 mb-0 ml-2">
                                {{ { running: 'Active', paused: 'Paused', inactive: 'Inactive' }[stats.status] }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Workload Card -->
        <div class="card overflow-hidden mt-4" v-if="workload.length">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">Current Workload</h2>
            </div>
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Queue</th>
                        <th class="text-right" style="width: 120px;">Jobs</th>
                        <th class="text-right" style="width: 120px;">Processes</th>
                        <th class="text-right" style="width: 180px;">Wait</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="queue in workload" :key="queue.name">
                        <tr>
                            <td :class="{ 'font-weight-bold': queue.split_queues }">
                                {{ queue.name.replace(/,/g, ', ') }}
                            </td>
                            <td class="text-right text-muted">{{ queue.length ? queue.length.toLocaleString() : 0 }}</td>
                            <td class="text-right text-muted">{{ queue.processes ? queue.processes.toLocaleString() : 0 }}</td>
                            <td class="text-right text-muted">{{ humanTime(queue.wait) }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>