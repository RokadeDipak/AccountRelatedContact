import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import ACCOUNT_SELECTED_CHANNEL from '@salesforce/messageChannel/AccountRlatedContact__c';
import searchAccounts from '@salesforce/apex/AccRelatedContacts.searchAccounts';

export default class AccountContactSearch extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedAccountId;

    @wire(MessageContext)
    messageContext;

    handleSearch(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length > 0) {
            searchAccounts({ searchTerm: this.searchTerm })
                .then(result => {
                    this.searchResults = result.map(account => ({
                        label: account.Name,
                        value: account.Id
                    }));
                })
                .catch(error => {
                    // Handle error
                });
        } else {
            this.searchResults = [];
        }
    }

    handleAccountSelection(event) {
        this.selectedAccountId = event.target.value;
        const payload = { accountId: this.selectedAccountId };
        publish(this.messageContext, ACCOUNT_SELECTED_CHANNEL, payload);
    }
}