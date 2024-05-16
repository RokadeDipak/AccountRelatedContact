public with sharing class AccRelatedContacts {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchTerm) {
        String searchKey = '%' + searchTerm + '%';
        return [SELECT Id, Name FROM Account WHERE Name LIKE :searchKey];
    }
    
     @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(String accountId) {
        return [SELECT Id, Name, Email, Phone FROM Contact WHERE AccountId = :accountId];
    }
}