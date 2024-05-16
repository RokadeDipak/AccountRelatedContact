import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import ACCOUNT_SELECTED_CHANNEL from '@salesforce/messageChannel/AccountRlatedContact__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getContacts from '@salesforce/apex/AccRelatedContacts.getContacts';

const actions = [
    { label: 'Delete', name: 'delete' }
];

export default class AccountContactSearch1 extends NavigationMixin(LightningElement) {
    @wire(MessageContext)
    messageContext;

    contactData = [];
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'url', typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }, sortable: true, cellAttributes: { iconName: { fieldName: 'iconName' }, iconPosition: 'left' }, sortable: true,
            typeAttributes: {label: { fieldName: 'Name' }, target: '_blank' }
        },
        { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
        { type: 'action', typeAttributes: { rowActions: actions } }
    ];

    subscription;
    wiredContacts;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            ACCOUNT_SELECTED_CHANNEL,
            (message) => this.handleAccountSelected(message)
        );
    }

    handleAccountSelected(message) {
        if (message && message.accountId) {
            this.wiredContacts = getContacts({ accountId: message.accountId })
                .then(result => {
                    this.contactData = result.map(contact => ({
                        ...contact,
                        Name: `/${contact.Id}`,
                        iconName: 'standard:contact'
                    }));
                })
                .catch(error => {
                    // Handle error
                });
        }
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
    }

    async handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'delete':
                await this.deleteContact(row.Id);
                break;
            default:
                break;
        }
    }

    async deleteContact(contactId) {
        try {
            await deleteRecord(contactId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contact deleted successfully',
                    variant: 'success'
                })
            );
            this.refreshContacts();
        } catch (error) {
            // Handle error
            console.error('Error deleting contact:', error);
        }
    }

    refreshContacts() {
        return refreshApex(this.wiredContacts);
    }
}