<script>
import JobRow from './job-row';

export default {
    components: {
        JobRow,
    },

    data() {
        return {
            ready: false, // Indicates if the data is ready to display
            loadingNewEntries: false, // Tracks loading state for new entries
            hasNewEntries: false, // Tracks if there are new entries available
            page: 1, // Current page
            perPage: 50, // Number of jobs per page
            totalPages: 1, // Total number of pages
            jobs: [], // List of jobs
            interval: null, // Interval for periodic refresh
        };
    },

    mounted() {
        this.updatePageTitle();
        this.loadJobs();
        this.refreshJobsPeriodically();
    },

    beforeUnmount() {
        // Clean up the refresh interval to avoid memory leaks
        if (this.interval) {
            clearInterval(this.interval);
        }
    },

    watch: {
        // Watch for route changes and reload data accordingly
        '$route.params.type'() {
            this.updatePageTitle();
            this.page = 1; // Reset to the first page
            this.loadJobs();
        },
    },

    methods: {
        /**
         * Load jobs based on the current route and pagination.
         */
        async loadJobs(starting = -1, refreshing = false) {
            try {
                if (!refreshing) {
                    this.ready = false;
                }

                const response = await this.$http.get(
                    `${Horizon.basePath}/api/jobs/${this.$route.params.type}?starting_at=${starting}&limit=${this.perPage}`
                );

                if (
                    !this.$root.autoLoadsNewEntries &&
                    refreshing &&
                    this.jobs.length &&
                    response.data.jobs[0]?.id !== this.jobs[0]?.id
                ) {
                    this.hasNewEntries = true;
                } else {
                    this.jobs = response.data.jobs;
                    this.totalPages = Math.ceil(response.data.total / this.perPage);
                    this.hasNewEntries = false;
                }

                this.ready = true;
            } catch (error) {
                console.error('Failed to load jobs:', error);
                this.ready = true; // Prevent blank pages on error
            }
        },

        /**
         * Load new entries and reset the job list.
         */
        async loadNewEntries() {
            try {
                this.loadingNewEntries = true;
                this.jobs = [];
                await this.loadJobs(-1, false);
                this.hasNewEntries = false;
            } catch (error) {
                console.error('Failed to load new entries:', error);
            } finally {
                this.loadingNewEntries = false;
            }
        },

        /**
         * Periodically refresh jobs.
         */
        refreshJobsPeriodically() {
            this.interval = setInterval(() => {
                if (this.page !== 1) {
                    return;
                }

                this.loadJobs(-1, true);
            }, 3000);
        },

        /**
         * Load the previous page of jobs.
         */
        previous() {
            if (this.page > 1) {
                this.page -= 1;
                this.loadJobs((this.page - 1) * this.perPage);
                this.hasNewEntries = false;
            }
        },

        /**
         * Load the next page of jobs.
         */
        next() {
            if (this.page < this.totalPages) {
                this.page += 1;
                this.loadJobs((this.page - 1) * this.perPage);
                this.hasNewEntries = false;
            }
        },

        /**
         * Update the page title based on the current route.
         */
        updatePageTitle() {
            const type = this.$route.params.type;
            const titleMap = {
                pending: 'Horizon - Pending Jobs',
                silenced: 'Horizon - Silenced Jobs',
                completed: 'Horizon - Completed Jobs',
            };

            document.title = titleMap[type] || 'Horizon - Jobs';
        },
    },
};
</script>

<template>
    <div>
        <!-- Card Header -->
        <div class="card overflow-hidden">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">{{ $route.params.type.charAt(0).toUpperCase() + $route.params.type.slice(1) }} Jobs</h2>
            </div>

            <!-- Loading State -->
            <div v-if="!ready" class="d-flex align-items-center justify-content-center card-bg-secondary p-5 bottom-radius">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="icon spin mr-2 fill-text-color">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <!-- No Jobs State -->
            <div
                v-if="ready && jobs.length === 0"
                class="d-flex flex-column align-items-center justify-content-center card-bg-secondary p-5 bottom-radius"
            >
                <span>There aren't any jobs.</span>
            </div>

            <!-- Jobs Table -->
            <table v-if="ready && jobs.length > 0" class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Job</th>
                        <th v-if="$route.params.type === 'pending'" class="text-right">Queued</th>
                        <th v-if="$route.params.type !== 'pending'">Queued</th>
                        <th v-if="$route.params.type !== 'pending'">Completed</th>
                        <th v-if="$route.params.type !== 'pending'" class="text-right">Runtime</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- New Entries -->
                    <tr v-if="hasNewEntries" key="newEntries" class="dontanimate">
                        <td colspan="100" class="text-center card-bg-secondary py-1">
                            <small>
                                <a href="#" @click.prevent="loadNewEntries" v-if="!loadingNewEntries">Load New Entries</a>
                            </small>
                            <small v-if="loadingNewEntries">Loading...</small>
                        </td>
                    </tr>

                    <!-- Job Rows -->
                    <job-row v-for="job in jobs" :key="job.id" :job="job" />
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="ready && jobs.length > 0" class="p-3 d-flex justify-content-between border-top">
                <button @click="previous" class="btn btn-secondary btn-sm" :disabled="page === 1">Previous</button>
                <button @click="next" class="btn btn-secondary btn-sm" :disabled="page >= totalPages">Next</button>
            </div>
        </div>
    </div>
</template>