<script type="text/ecmascript-6">
    export default {
        props: ['type', 'message', 'autoClose', 'confirmationProceed', 'confirmationCancel'],

        data(){
            return {
                timeout: null,
                anotherModalOpened: $('body').hasClass('modal-open')
            }
        },


        mounted() {
            $('#alertModal').modal({
                backdrop: 'static',
            });

            $('#alertModal').on('hidden.bs.modal', e => {
                this.$root.alert.type = null;
                this.$root.alert.autoClose = false;
                this.$root.alert.message = '';
                this.$root.alert.confirmationProceed = null;
                this.$root.alert.confirmationCancel = null;

                if (this.anotherModalOpened) {
                    $('body').addClass('modal-open');
                }
            });

            if (this.autoClose) {
                this.timeout = setTimeout(() => {
                    this.close();
                }, this.autoClose);
            }
        },


        methods: {
            /**
             * Close the modal.
             */
            close(){
                clearTimeout(this.timeout);

                $('#alertModal').modal('hide');
            },


            /**
             * Confirm and close the modal.
             */
            confirm(){
                this.confirmationProceed();

                this.close();
            },


            /**
             * Cancel and close the modal.
             */
            cancel(){
                if (this.confirmationCancel) {
                    this.confirmationCancel();
                }

                this.close();
            }
        }
    }
</script>

<template>
    <div class="modal" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <p class="m-0 py-4">{{message}}</p>
                </div>


                <div class="modal-footer justify-content-start flex-row-reverse">

                    <button v-if="type == 'error'" class="btn btn-primary" @click="close">
                        Close
                    </button>

                    <button v-if="type == 'success'" class="btn btn-primary" @click="close">
                        Okay
                    </button>


                    <button v-if="type == 'confirmation'" class="btn btn-danger" @click="confirm">
                        Yes
                    </button>
                    <button v-if="type == 'confirmation'" class="btn" @click="cancel">
                        Cancel
                    </button>

                </div>
            </div>
        </div>
    </div>
</template>

<style>
    #alertModal {
        z-index: 99999;
        background: rgba(0, 0, 0, 0.5);
    }

    #alertModal svg {
        display: block;
        margin: 0 auto;
        width: 4rem;
        height: 4rem;
    }
</style>
<script>
export default {
    props: {
        type: {
            type: String,
            required: true, // Ensure the modal type is passed
        },
        message: {
            type: String,
            default: '', // Default to an empty string if no message is provided
        },
        autoClose: {
            type: Number, // Specify that autoClose should be a number (milliseconds)
            default: null, // Default to no auto-close
        },
        confirmationProceed: {
            type: Function, // Confirm button callback function
            default: null, // Optional
        },
        confirmationCancel: {
            type: Function, // Cancel button callback function
            default: null, // Optional
        },
    },

    data() {
        return {
            timeout: null, // Timeout ID for autoClose
            anotherModalOpened: false, // Track if another modal was already open
        };
    },

    mounted() {
        // Detect if another modal was already open
        this.anotherModalOpened = document.body.classList.contains('modal-open');

        // Initialize the modal
        const alertModal = new bootstrap.Modal(document.getElementById('alertModal'), {
            backdrop: 'static',
        });

        alertModal.show();

        // Set up autoClose if enabled
        if (this.autoClose) {
            this.timeout = setTimeout(() => {
                this.close(alertModal);
            }, this.autoClose);
        }

        // Handle when the modal is hidden
        document.getElementById('alertModal').addEventListener('hidden.bs.modal', () => {
            this.resetRootAlert();

            // Restore modal-open class if another modal was already open
            if (this.anotherModalOpened) {
                document.body.classList.add('modal-open');
            }
        });
    },

    beforeUnmount() {
        // Clear timeout when component is destroyed
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    },

    methods: {
        /**
         * Close the modal and reset the state.
         */
        close(modalInstance) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            const modal = modalInstance || bootstrap.Modal.getInstance(document.getElementById('alertModal'));
            if (modal) {
                modal.hide();
            }
        },

        /**
         * Confirm the action and close the modal.
         */
        confirm() {
            if (typeof this.confirmationProceed === 'function') {
                this.confirmationProceed();
            }
            this.close();
        },

        /**
         * Cancel the action and close the modal.
         */
        cancel() {
            if (typeof this.confirmationCancel === 'function') {
                this.confirmationCancel();
            }
            this.close();
        },

        /**
         * Reset the root alert state.
         */
        resetRootAlert() {
            this.$root.alert = {
                type: null,
                autoClose: false,
                message: '',
                confirmationProceed: null,
                confirmationCancel: null,
            };
        },
    },
};
</script>

<template>
    <div
        class="modal fade"
        id="alertModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="alertModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <p class="m-0 py-4">{{ message }}</p>
                </div>

                <div class="modal-footer justify-content-start flex-row-reverse">
                    <button
                        v-if="type === 'error'"
                        class="btn btn-primary"
                        @click="close"
                    >
                        Close
                    </button>

                    <button
                        v-if="type === 'success'"
                        class="btn btn-primary"
                        @click="close"
                    >
                        Okay
                    </button>

                    <button
                        v-if="type === 'confirmation'"
                        class="btn btn-danger"
                        @click="confirm"
                    >
                        Yes
                    </button>
                    <button
                        v-if="type === 'confirmation'"
                        class="btn"
                        @click="cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#alertModal {
    z-index: 1055; /* Corrected Bootstrap z-index value */
    background: rgba(0, 0, 0, 0.5);
}

#alertModal svg {
    display: block;
    margin: 0 auto;
    width: 4rem;
    height: 4rem;
}
</style>