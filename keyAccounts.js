import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Accounts from '@salesforce/schema/Account';
import keyaccount from '@salesforce/apex/KeyAccountquery.KeyAccountlist';
import accountProgram from '@salesforce/schema/Account.Type';
import Opportunity from '@salesforce/schema/Opportunity';
import Opportunitysalesarea from '@salesforce/schema/Opportunity.Sales_Area__c';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
import strUserId from '@salesforce/user/Id';
import {getRecord} from 'lightning/uiRecordApi';



export default class KeyAccountSalesLWC extends LightningElement {

   @track prfName;
   kam = false;
   Nonkam = false;

    @wire(getRecord, {recordId: strUserId,fields: [PROFILE_NAME_FIELD]}) 
    wireuser({error,data }) {
        if (error) {
           this.error = error ; 
        } else if (data) {
            this.prfName =data.fields.Profile.value.fields.Name.value; 
            console.log(this.prfName);
            if(this.prfName === 'Inspire KAM User' || this.prfName === 'Infinity KAM User'){
                     this.kam = true;

            }else{
                this.Nonkam =true;
            }
            if(this.prfName == 'Inspire KAM User'){
                this.recordtype = 'Inspire';
              }
              if(this.prfName == 'Infinity KAM User'){
                this.recordtype = 'Infinity';
              }
        }
    }
     

     
    get options() {
        return [
            { label: '--None--', value:null},
            { label: 'Strategic Account', value: 'Strategic Account'},
            { label: 'National Key Account', value: 'National Key Account'},
            { label: 'Build +', value: 'Build +'},
            { label: 'Udaan', value: 'Udaan'},
            { label: 'GrowARC', value: 'GrowARC'},
            { label: 'Platinum Customer', value: 'Platinum Customer'},
            { label: 'SGA Assured Processor', value: 'SGA Assured Processor'},
            { label: 'Kings Club', value: 'Kings Club'},
            { label: 'Inspirations', value: 'Inspirations'},
            { label: 'Modern Homes', value: 'Modern Homes'},
            { label: 'Udaan Processor', value: 'Udaan Processor'},
            { label: 'Inspire Strategic Account', value: 'Inspire Strategic Account'},
            { label: 'SG honors', value: 'SG honors'},
            { label: 'NKA/SKA Inspire', value: 'NKA/SKA Inspire'},
            { label: 'Star Architect', value: 'StartArchitecht'},
            { label: 'Star', value: 'Star'},
            { label: 'GlassIcon INS', value: 'GlassIcon INS'},
        ];
    }
    get business(){
        return [
            {label: 'Infinity',value: 'Infinity'},
            {label: 'Inspire',value: 'Inspire'},
        ];
    }
@track data =[];
@track columns;
@track error;
@track recordtype;
@track sales;
loaded = false;
@track grouped;
@track accounttype;
@track fromdate;
@track todate;
@track accprogram;
Inspire = false;
Infinity = false;
Gdata = false;
@track PicklistValues;
@track PicklistValues2;
@wire (getObjectInfo,{objectApiName : Accounts})
accountInfo;
@wire (getObjectInfo,{objectApiName : Opportunity})
opportunityInfo;

@wire(getPicklistValues,
    {
    recordTypeId : '$opportunityInfo.data.defaultRecordTypeId',
    fieldApiName : Opportunitysalesarea,
}
)
picvalues(result) {
    if (result.data) {
       // console.log(JSON.stringify(result.data));
        this.PicklistValues = [ { label: '--None--', value:null, selected: true }, ...result.data.values ];
    } else if (result.error) {
        alert('ERROR');
    }
}
@wire(getPicklistValues,
    {
    recordTypeId : '$accountInfo.data.defaultRecordTypeId',
    fieldApiName : accountProgram,
}
)
accProgramvalues(result) {
    if (result.data) {
       // console.log(JSON.stringify(result.data));
        this.PicklistValues2 = [ { label: '--None--', value:null, selected: true }, ...result.data.values ];
    } else if (result.error) {
        alert('ERROR');
    }
}

    
handlebusinessChange(event){
  this.recordtype = event.target.value;
  
}
handlesalesareaChange(event){
    this.sales = event.target.value;
}
handleaccprogramChange(event){
 this.accprogram = event.target.value;
}
handleaccounttypeChange(event){
  this.accounttype = event.target.value;
}
fromDateChange(event){
    this.fromdate = event.target.value;
}
toDateChange(event){
    this.todate = event.target.value;
}



submit(){
    if(this.recordtype == null){
        this.error = 'Please Select Required Field';
        
    }else if(this.accprogram == null & this.sales ==null & this.accounttype ==null){
        this.error = 'Please select any One of these fields (Sales Area (or) Account Program (or) Account Type)';
        this.Gdata = false;
    }else if(this.fromdate == null & this.todate != null){
        this.error = 'Please fill the both dates';
        this.Gdata = false;
    }else if(this.fromdate != null & this.todate == null){
        this.error = 'Please fill the both dates';
        this.Gdata = false;
    }else{
    if(this.recordtype == 'Inspire'){
        this.Infinity = false;
        this.Inspire = true;
        
        //this.columns = columns;
    }else if(this.recordtype == 'Infinity'){
        this.Inspire = false;
        this.Infinity =true;
        //this.columns = columns1;
    }
    this.loaded = true;

    keyaccount({recordtype:this.recordtype,acctype:this.accounttype,sales:this.sales,accprogram:this.accprogram,fdate:this.fromdate,tdate:this.todate})
    .then(result=>{
        console.log('data======>'+result);
        //this.data = result;
        this.loaded = false;
        const filteredList = result.filter((item, index) => {
            return index === result.findIndex(obj => {
                return JSON.stringify(obj) === JSON.stringify(item);
            });
          });
          this.data = filteredList;
          console.log('###########'+JSON.stringify(filteredList) );
    
            if(this.data == null || this.data == ''){
                this.error = 'No Records Found';
                this.Gdata = false;
            }else{
            this.Gdata = true;
            this.error = undefined;
            }
            
            

//console.log('ssssssss'+filtered);
        })
        
    .catch(error=>{
        this.loaded = false;
        this.error = error; //.body.message;
    
    })
    }
}
get groupedData() {
    const grouped = this.data.reduce((acc, obj) => {
        const key = obj.AccountName;
        if (!acc[key]) {
            acc[key] = {
                AccountName: key,   
                oppdata: []
             
            };
        }
        acc[key].oppdata.push(obj);
        return acc;
    }, {});
    this.loaded = false;
    console.log('Groupdata@@@@@@'+JSON.stringify(grouped));
    return Object.values(grouped);
   
}

exportData(){
    // Prepare a html table
    console.log('ppapapap==='+this.recordtype)
    if(this.recordtype == 'Infinity'){
    let doc = '<table>';
    // Add styles for the table
    doc += '<style>';
    doc += 'table, th, td {';
    doc += '    border: 1px solid black;';
    doc += '    border-collapse: collapse;';
    doc += '}';          
    doc += '</style>';
    // Add all the Table Headers
    doc += '<tr>';
               
        doc += '<th>'+ 'Account Name' +'</th>';
        doc += '<th>'+ 'opportunity Name' +'</th>';
        doc += '<th>'+ 'opportunity Region' +'</th>'; 
        doc += '<th>'+ 'Infinity SalesArea' +'</th>';          
        doc += '<th>'+ 'TotalEstimated Quantity' +'</th>';
        doc += '<th>'+ 'Appropriated Quantity' +'</th>';
       
    doc += '</tr>';
    // Add the data rows
    this.data.forEach(record => {
        
        doc += '<tr>';
        doc += '<th>'+record.AccountName+'</th>'; 
        doc += '<th>'+record.opportunityName+'</th>'; 
        doc += '<th>'+record.opportunityRegion+'</th>';
        doc += '<th>'+record.InfinitySalesArea+'</th>';
        doc += '<th>'+record.TotalEstimatedQuantity+'</th>';
        doc += '<th>'+record.AppropriatedQuantity+'</th>';
        
        doc += '</tr>';
    });
    doc += '</table>';

    var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    let downloadElement = document.createElement('a');
    downloadElement.href = element;
    downloadElement.target = '_self';
    // use .csv as extension on below line if you want to export data as csv
    downloadElement.download = 'Key Accounts.xls';
    document.body.appendChild(downloadElement);
    downloadElement.click(); 

  }else if(this.recordtype == 'Inspire'){

    let doc = '<table>';
    // Add styles for the table
    doc += '<style>';
    doc += 'table, th, td {';
    doc += '    border: 1px solid black;';
    doc += '    border-collapse: collapse;';
    doc += '}';          
    doc += '</style>';
    // Add all the Table Headers
    doc += '<tr>';
               
        doc += '<th>'+ 'Account Name' +'</th>';
        doc += '<th>'+ 'opportunity Name' +'</th>';
        doc += '<th>'+ 'opportunity Region' +'</th>';
        doc += '<th>'+ 'Inspire SalesArea' +'</th>';           
        doc += '<th>'+ 'TotalEstimated Quantity' +'</th>';
        doc += '<th>'+ 'Appropriated Quantity' +'</th>';
        
    doc += '</tr>';
    // Add the data rows
    this.data.forEach(record => {
        
        doc += '<tr>';
        doc += '<th>'+record.AccountName+'</th>'; 
        doc += '<th>'+record.opportunityName+'</th>'; 
        doc += '<th>'+record.opportunityRegion+'</th>';
        doc += '<th>'+record.InspireSalesArea+'</th>';
        doc += '<th>'+record.TotalEstimatedQuantity+'</th>';
        doc += '<th>'+record.AppropriatedQuantity+'</th>';
        
        doc += '</tr>';
    });
    doc += '</table>';
    var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    let downloadElement = document.createElement('a');
    downloadElement.href = element;
    downloadElement.target = '_self';
    // use .csv as extension on below line if you want to export data as csv
    downloadElement.download = 'Key Accounts.xls';
    document.body.appendChild(downloadElement);
    downloadElement.click(); 
    }
  }
}
