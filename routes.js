import Vue from 'vue';
import Router from 'vue-router';

// Lazy loading components for better performance
const Dashboard = () => import('./screens/dashboard');
const Monitoring = () => import('./screens/monitoring/index');
const MonitoringTag = () => import('./screens/monitoring/tag');
const MonitoringTagJobs = () => import('./screens/monitoring/tag-jobs');
const MetricsIndex = () => import('./screens/metrics/index');
const MetricsJobs = () => import('./screens/metrics/jobs');
const MetricsQueues = () => import('./screens/metrics/queues');
const MetricsPreview = () => import('./screens/metrics/preview');
const RecentJobs = () => import('./screens/recentJobs/index');
const JobDetails = () => import('./screens/recentJobs/job');
const FailedJobs = () => import('./screens/failedJobs/index');
const FailedJobDetails = () => import('./screens/failedJobs/job');
const Batches = () => import('./screens/batches/index');
const BatchPreview = () => import('./screens/batches/preview');

Vue.use(Router);

export default new Router({
    mode: 'history', // Use 'history' mode to avoid hash-based navigation
    routes: [
        { path: '/', redirect: '/dashboard' },

        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
        },

        {
            path: '/monitoring',
            name: 'monitoring',
            component: Monitoring,
        },

        {
            path: '/monitoring/:tag',
            component: MonitoringTag,
            children: [
                {
                    path: 'jobs',
                    name: 'monitoring-jobs',
                    component: MonitoringTagJobs,
                    props: { type: 'jobs' },
                },
                {
                    path: 'failed',
                    name: 'monitoring-failed',
                    component: MonitoringTagJobs,
                    props: { type: 'failed' },
                },
            ],
        },

        { path: '/metrics', redirect: '/metrics/jobs' },

        {
            path: '/metrics/',
            component: MetricsIndex,
            children: [
                {
                    path: 'jobs',
                    name: 'metrics-jobs',
                    component: MetricsJobs,
                },
                {
                    path: 'queues',
                    name: 'metrics-queues',
                    component: MetricsQueues,
                },
            ],
        },

        {
            path: '/metrics/:type/:slug',
            name: 'metrics-preview',
            component: MetricsPreview,
        },

        {
            path: '/jobs/:type',
            name: 'jobs',
            component: RecentJobs,
        },

        {
            path: '/jobs/pending/:jobId',
            name: 'pending-jobs-preview',
            component: JobDetails,
        },

        {
            path: '/jobs/completed/:jobId',
            name: 'completed-jobs-preview',
            component: JobDetails,
        },

        {
            path: '/jobs/silenced/:jobId',
            name: 'silenced-jobs-preview',
            component: JobDetails,
        },

        {
            path: '/failed',
            name: 'failed-jobs',
            component: FailedJobs,
        },

        {
            path: '/failed/:jobId',
            name: 'failed-jobs-preview',
            component: FailedJobDetails,
        },

        {
            path: '/batches',
            name: 'batches',
            component: Batches,
        },

        {
            path: '/batches/:batchId',
            name: 'batches-preview',
            component: BatchPreview,
        },

        // Catch-all route for 404 pages
        {
            path: '*',
            name: 'not-found',
            component: () => import('./screens/NotFound.vue'), // Create a NotFound.vue for handling 404 errors
        },
    ],
});