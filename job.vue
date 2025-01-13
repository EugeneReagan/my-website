<template>
    <div>
        <!-- Job Details Card -->
        <div class="card overflow-hidden">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">{{ ready ? job.name : "Job Preview" }}</h2>
                <a data-toggle="collapse" href="#collapseDetails" role="button">Collapse</a>
            </div>

            <!-- Loading State -->
            <div v-if="!ready" class="d-flex align-items-center justify-content-center card-bg-secondary p-5 bottom-radius">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="icon spin mr-2 fill-text-color">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <!-- Job Details -->
            <div class="card-body card-bg-secondary collapse show" id="collapseDetails" v-if="ready">
                <div class="row mb-2">
                    <div class="col-md-2 text-muted">ID</div>
                    <div class="col">{{ job.id }}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-md-2 text-muted">Queue</div>
                    <div class="col">{{ job.queue }}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-md-2 text-muted">Pushed</div>
                    <div class="col">{{ readableTimestamp(job.payload.pushedAt) }}</div>
                </div>
                <div class="row mb-2" v-if="prettyPrintJob(job.payload.data)?.batchId">
                    <div class="col-md-2 text-muted">Batch</div>
                    <div class="col">
                        <router-link :to="{ name: 'batches-preview', params: { batchId: prettyPrintJob(job.payload.data).batchId } }">
                            {{ prettyPrintJob(job.payload.data).batchId }}
                        </router-link>
                    </div>
                </div>
                <div class="row mb-2" v-if="delayed">
                    <div class="col-md-2 text-muted">Delayed Until</div>
                    <div class="col">{{ delayed }}</div>
                </div>
                <div class="row">
                    <div class="col-md-2 text-muted">Completed</div>
                    <div class="col">{{ job.completed_at ? readableTimestamp(job.completed_at) : "-" }}</div>
                </div>
            </div>
        </div>

        <!-- Job Data -->
        <div class="card overflow-hidden mt-4" v-if="ready">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">Data</h2>
                <a data-toggle="collapse" href="#collapseData" role="button">Collapse</a>
            </div>
            <div class="card-body code-bg text-white collapse show" id="collapseData">
                <vue-json-pretty :data="prettyPrintJob(job.payload.data)" />
            </div>
        </div>

        <!-- Job Tags -->
        <div class="card overflow-hidden mt-4" v-if="ready && job.payload.tags.length">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="h6 m-0">Tags</h2>
                <a data-toggle="collapse" href="#collapseTags" role="button">Collapse</a>
            </div>
            <div class="card-body code-bg text-white collapse show" id="collapseTags">
                <vue-json-pretty :data="job.payload.tags" />
            </div>
        </div>
    </div>
</template>

<script>
import phpunserialize from "phpunserialize";
import moment from "moment-timezone";

export default {
    components: {
        'stack-trace': require('./../../components/Stacktrace').default,
    },

    data() {
        return {
            ready: false, // Tracks loading state
            job: {}, // Stores job data
        };
    },

    computed: {
        /**
         * Compute delayed time for the job.
         */
        delayed() {
            try {
                const unserialized = phpunserialize(this.job.payload.data.command);
                if (unserialized?.delay?.date) {
                    return moment
                        .tz(unserialized.delay.date, unserialized.delay.timezone)
                        .local()
                        .format("YYYY-MM-DD HH:mm:ss");
                } else if (unserialized?.delay) {
                    return moment
                        .unix(this.job.payload.pushedAt)
                        .add(unserialized.delay, "seconds")
                        .local()
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            } catch (err) {
                console.error("Failed to unserialize delay data:", err);
            }
            return null;
        },
    },

    mounted() {
        this.loadJob(this.$route.params.jobId);
        document.title = "Horizon - Job Detail";
    },

    methods: {
        /**
         * Load job details by ID.
         */
        async loadJob(id) {
            this.ready = false;
            try {
                const response = await this.$http.get(`${Horizon.basePath}/api/jobs/${id}`);
                this.job = response.data;
                this.ready = true;

                // Update page title with job name
                document.title = `Horizon - ${this.job.name}`;
            } catch (error) {
                console.error("Failed to load job:", error);
                this.ready = true; // Prevent infinite loading state
            }
        },

        /**
         * Format timestamps into a readable format.
         */
        readableTimestamp(timestamp) {
            return timestamp ? moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss") : "-";
        },

        /**
         * Pretty print serialized job data.
         */
        prettyPrintJob(data) {
            try {
                return data.command && !data.command.includes("CallQueuedClosure")
                    ? phpunserialize(data.command)
                    : data;
            } catch (err) {
                console.error("Failed to unserialize job data:", err);
                return data;
            }
        },
    },
};
</script>