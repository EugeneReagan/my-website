<script>
export default {
    props: {
        trace: {
            type: Array, // Explicitly declare the expected type
            required: true, // Mark as required to ensure data is passed
        },
    },

    /**
     * The component's data.
     */
    data() {
        return {
            minimumLines: 5, // Number of lines to show initially
            showAll: false, // Controls whether to show all lines
        };
    },

    computed: {
        /**
         * Compute the lines to display based on showAll toggle.
         */
        lines() {
            return this.trace.slice(0, this.showAll ? this.trace.length : this.minimumLines);
        },
    },

    methods: {
        /**
         * Toggle to show all lines.
         */
        toggleShowAll() {
            this.showAll = true;
        },
    },
};
</script>

<template>
    <div class="table-responsive">
        <table class="table mb-0">
            <tbody>
                <!-- Render each line in the trace -->
                <tr v-for="(line, index) in lines" :key="index">
                    <td class="card-bg-secondary"><code>{{ line }}</code></td>
                </tr>

                <!-- "Show All" link displayed only if not all lines are shown -->
                <tr v-if="!showAll">
                    <td class="card-bg-secondary">
                        <a href="#" @click.prevent="toggleShowAll">Show All</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* Add your styles here, if needed */
</style>