$( document ).ready(function() {
    var APP_CLIENT_ID = "0000000040103885";
    var REDIRECT_URL = "http://sr.local/github/Skydrive/index.html";
    var DOCUMENTS_FOLDER_ID;
    var FILES =  new Object();
    var NEW_DIR = new Object();
    var ROOT_DIR;
    WL.init({ client_id: APP_CLIENT_ID, redirect_uri: REDIRECT_URL });
    WL.Event.subscribe("auth.login", onLogin);
    WL.Event.subscribe("auth.sessionChange", onSessionChange);

    var session = WL.getSession();
    if (session) {
        log("You are already signed in!");
    } else {
        log("Please login.");
    }
    $( "#login" ).click(function() {
        signInUser();
    });
    $( "#logout" ).click(function() {
        WL.logout();
        log("Please login.");
    });
    $( "#showUserData" ).click(function() {
        showUserData();
    });
    $( "#listFolders" ).click(function() {
        listFolders("");
    });
    $( "#getQuota" ).click(function() {
        getQuota();
    });
    $( "#getFiles" ).click(function() {
        getFiles();
    });
    function onLogin() {
        var session = WL.getSession();
        if (session) {
            log("You are signed in!");
        }
    }
    function signInUser() {
        if (!session) {
            WL.login({
                scope: "wl.signin wl.skydrive wl.basic wl.birthday wl.emails"
            });
        }
    }
    function onSessionChange() {
        var session = WL.getSession();
        if (session) {
            log("Your session has changed.");
        }
    }
    function showUserData() {
        WL.api({ path: "/me", method: "GET" }).then(
            function(response) {
                fillRegistrationForm(response);
            },
            function(response) {
                log("API call failed: " + JSON.stringify(response.error).replace(/,/g, "\n"));
            }
        );
    }

    function fillRegistrationForm(user) {
        // NOTE: Assign these values to your form elements to streamline registration.
        log("First name: " + user.first_name);
        log("Last name: " + user.last_name);
        log("Preferred email: " + user.emails.preferred);
        log("Gender: " + user.gender);
        log("Birthday: " + user.birth_month + "/" + user.birth_day + "/" + user.birth_year);
    }
    function listFolders(subFolderByID) {
        if(subFolderByID.length != 0) {
            var FilesPath = "/"+subFolderByID+"/files";
        }else {
            var FilesPath = "/me/skydrive/files";
        }

        WL.api({ path: FilesPath, method: "GET" }).then(
            onGetFoldersComplete,
            function(response) {
                var jsonFeed = JSON.stringify(response.error).replace(/,/g, ",\n")
                log("Cannot get files and folders: " + jsonFeed);


            }
        );
    }

    function onGetFoldersComplete(response) {
        var items = response.data;
        var foundFolder = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type === "folder") {
                var jsonFeed = JSON.stringify(items[i]).replace(/,/g, ",\n");
                var parsedJson = JSON && JSON.parse(jsonFeed) || $.parseJSON(jsonFeed);
                //log("Found a folder with the following information: " + jsonFeed);
                log("<p></p>"+"Folder name: " + parsedJson.name);
                log("Folder id: " + parsedJson.id);
                log("Folder parent_id: " + parsedJson.parent_id);
                log("Folder upload_location: " + parsedJson.upload_location);
                log("Folder link: " + parsedJson.link);
                log("Folder created_time: " + parsedJson.created_time);
                log("Folder updated_time: " + parsedJson.updated_time);
                log("Folder shared_with: " + (parsedJson.shared_with).access);
                log("Folder count: " + parsedJson.count+ "<p></p>");
                foundFolder += 1;
                if(parsedJson.count != 0) {
                    listFolders(parsedJson.id); //if we find a folder, list its contents.
                }

                if(parsedJson.name == "Documents") {
                    DOCUMENTS_FOLDER_ID = parsedJson.id;
                    //we know Documents parent is the root directory.
                    ROOT_DIR = parsedJson.parent_id;
                }
                NEW_DIR[parsedJson.id] = parsedJson.parent_id;
            }
            if (items[i].type === "file"){
                var jsonFileFeed = JSON.stringify(items[i]).replace(/,/g, ",\n");
                var parsedJson = JSON && JSON.parse(jsonFileFeed) || $.parseJSON(jsonFileFeed);

                //log("Found a folder with the following information: " + jsonFileFeed);
                log("<p></p>"+"File name: " + parsedJson.name);
                log("File id: " + parsedJson.id);
                log("File parent_id: " + parsedJson.parent_id);
                log("File upload_location: " + parsedJson.upload_location);
                log("File link: " + parsedJson.link);
                log("File created_time: " + parsedJson.created_time);
                log("File updated_time: " + parsedJson.updated_time);

                log("File shared_with: " + (parsedJson.shared_with).access + "<p></p>");
                NEW_DIR[parsedJson.id] = parsedJson.parent_id;
            }

            FILES[parsedJson.id] = parsedJson;
        }

        if (foundFolder == 0) {
            log("Unable to find any folders");
        }
    }
    function getFiles() {
        logRight("NAME of file/folder : PARENT NAME of file/folder<br />")
        for ( property in NEW_DIR ) {
            logRight( property + " : " + NEW_DIR[property] + "<br />"); // Outputs: foo, fiz or fiz, foo
        }

    }
    function getQuota() {
        WL.api({ path: "/me/skydrive/quota", method: "GET" }).then(
            function(response) {
                log(JSON.stringify(response).replace(/,/g, ",\n"));
            },
            function(response) {
                log("Could not access quota, status = " +
                    JSON.stringify(response.error).replace(/,/g, ",\n"));
            }
        );
    }

    function log(message) {
        $("#JsOutputDiv").append(message+"<br />");
//        var child = document.createTextNode(message);
//        var parent = document.getElementById('JsOutputDiv') || document.body;
//        parent.appendChild(child);
//        parent.appendChild(document.createElement("br"));
    }
    function logRight(message) {
        $("#JsOutputDivRight").append(message+"<br />");
    }
});
