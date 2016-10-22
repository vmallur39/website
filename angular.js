angular.module('myApp', ['ngMaterial']).controller('myCtrl', function($http, $mdDialog, $mdToast, $scope, $window) {
    
    
    /* REST API tab */


    // gapi is a  JavaScript library to access Google's APIs
    var gapiParams = {
        'client_id': '122885520850-m17or2ottemvcjdtie71vvtgog43be85.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/drive.readonly',
        'immediate': false,
        'response_type': 'token',
        'approval_prompt': 'force',
        'redirect_uri': 'postmessage'
    };    

    $scope.files = [];
    $scope.isAuthorized = false;
    $scope.parentFolder = '';
    $scope.rootFolder = '';
    
    $scope.getDriveContents = function() {        
        gapi.auth.authorize(gapiParams).then(function(token) {
            $scope.isAuthorized = true;
            gapi.client.load('drive', 'v3').then(function() { 
                gapi.client.drive.files.list({
                    'fields': 'files(iconLink, id, mimeType, name, parents, webViewLink)',
                    'orderBy': 'folder, name',
                    'q': "'root' in parents"
                }).then(function(response) {
                    $scope.files = response.result.files;    
                    $scope.$apply();
                    console.log($scope.files);    

                    $scope.parentFolder = $scope.files[0].parents[0]; 
                    $scope.rootFolder = $scope.files[0].parents[0];               
                });
            });
        });             
    };

    $scope.moveUpOneFolder = function() {
        if ($scope.parentFolder === $scope.rootFolder) {
            $mdDialog.show($mdDialog.alert().title('You are in the root folder!').ok('OK'));
        }
        else {
            gapi.client.drive.files.get({
                'fileId': $scope.parentFolder,
                'fields': 'parents'                          
            }).then(function(response) {
                gapi.client.drive.files.list({
                    'fields': 'files(iconLink, id, mimeType, name, parents, webViewLink)',
                    'orderBy': 'folder, name',
                    'q': "'" + response.result.parents[0] + "' in parents"
                }).then(function(files) {
                    $scope.files = files.result.files;                   
                    $scope.$apply();
                    console.log($scope.files);     

                    $scope.parentFolder = $scope.files[0].parents[0];                                           
                });
            });
        }     
    };

    $scope.openFile = function(file) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {            
            gapi.client.drive.files.list({
                'fields': 'files(iconLink, id, mimeType, name, parents, webViewLink)',
                'orderBy': 'folder, name',
                'q': "'" + file.id + "' in parents"
            }).then(function(response) {
                $scope.files = response.result.files; 
                $scope.$apply();
                console.log($scope.files);  

                $scope.parentFolder = $scope.files[0].parents[0];                     
            });     
        }
        else {
            $window.open(file.webViewLink, '_blank');
        }
    };    




    /* Web Service tab */

    $scope.countries = ['Canada', 'US', 'Mexico'];

    // Call web service when country changes
    $scope.$watch('selectedCountry', function() {       
        if ($scope.selectedCountry)
        {
            $.ajax({
                url: "http://www.webservicex.net/globalweather.asmx/GetCitiesByCountry?CountryName=" + $scope.selectedCountry,
                dataType: "jsonp"
            }).then(function(response) {
                // Success
            }, function(error) {
                $mdToast.show($mdToast.simple().textContent('See response in Network tab'));
            });
        }       
    });
});