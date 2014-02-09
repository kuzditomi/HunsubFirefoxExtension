// ==UserScript==
// @name        d2jsp Hunsub Extension
// @namespace   kuzditomi.hunsub.ffextension
// @description d2jsp Hunsub Extension
// @include     about:home
// @include     *.d2jsp.org/*
// @version     1
// @grant    GM_getValue
// @grant    GM_setValue
// @grant    GM_addStyle
// ==/UserScript==
var a = document.querySelector('.tbb'),
    userDivs,
    blockQuotes = false;
if(a){
    userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
    blockUsers();
    addButtons();
}
addSettings();

function addButtons(){
    for(var i =0;i < userDivs.length-1;i++){
        var userDiv = userDivs[i];
        var links = userDiv.querySelector('.fR.links');
        var blockLink = document.createElement('a');

        if(!links || !blockLink)
            continue;

        var nameAnchor = userDiv.querySelector('dt a');
        var start = nameAnchor.href.indexOf('user.php?i=');
        var userId = nameAnchor.href.substring(start+11,nameAnchor.length);
        var userName = nameAnchor.textContent;
        (function(userId,userName){
            blockLink.addEventListener('click',function() {
                blockUser(userId,userName);
            });
        })(userId,userName);

        blockLink.textContent = "Block";
        blockLink.style.cursor = "pointer";
        links.appendChild(blockLink);
    }
}

function blockUsers(){
    console.log('starting');
    var blockQuotes = GM_getValue('blockQuotes'),
        blockedUsers = GM_getValue('blockedUsers') || {};

    try{
        if(blockedUsers)
            blockedUsers = JSON.parse(blockedUsers);
        else
            blockedUsers = {};
    } catch(e) {
        blockedUsers = {};
    }

    userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
    for(var i =0;i < userDivs.length-1;i++){
        var userDiv = userDivs[i];
        var nameAnchor = userDiv.querySelector('dt a');
        var start = nameAnchor.href.indexOf('user.php?i=');
        var userId = nameAnchor.href.substring(start+11,nameAnchor.length);
        if(blockedUsers[userId]){
            userDiv.parentNode.removeChild(userDiv);
        }else if(blockQuotes){
            var quoteDivs = userDiv.querySelectorAll('.quote1');
            for(var j = 0;j<quoteDivs.length;j++){
                var quoteDiv = quoteDivs[j],
                    match = quoteDiv.textContent.match(/Quote\s\(([^\s]+)/);
                if(!match)
                    return;
                var userName = match[1];
                for(var prop in blockedUsers) {
                    if(blockedUsers.hasOwnProperty(prop)) {
                        if(blockedUsers[prop] === userName) {
                            var quote = quoteDiv.nextSibling,
                                br1 = quote.nextSibling,
                                br2 = br1.nextSibling;

                            quoteDiv.parentNode.removeChild(quoteDiv);
                            quote.parentNode.removeChild(quote);
                            br1.parentNode.removeChild(br1);
                            br2.parentNode.removeChild(br2);
                        }
                    }
                }
            }
        }
    }
}

function blockUser(userId, userName){
    var blockedUsers = GM_getValue('blockedUsers');
    try{
        if(blockedUsers)
            blockedUsers = JSON.parse(blockedUsers);
        else
            blockedUsers = {};
    } catch(e) {
        blockedUsers = {};
    }

    blockedUsers[userId] = userName;
    GM_setValue('blockedUsers',JSON.stringify(blockedUsers));
    blockUsers();
}

function addSettings() {
    var leftBar = document.querySelector('div.bar > ul.barL'),
        blockedSettings;

    blockedSettings = document.createElement('li');
    blockedSettings.innerHTML = '<a style="cursor: pointer;">Blocked users</a>';
    blockedSettings.addEventListener('click',showBlockedSettings);

    leftBar.appendChild(blockedSettings);
}


function showBlockedSettings() {
    var container,
        leftBar = document.querySelector('div.bar > ul.barL'),
        usersdiv,
        cbBlockQuotes,
        blockQuotes,
        i;

    if(document.getElementById('settingsContainer'))
        return;

    container = document.createElement('div');
    container.innerHTML =
        '<div class="close" id="closeButton">close[X]</div>' +
            '<h1>D2jsp post blocker</h1>' +
            'block quotes: ' +
            '<input type="checkbox" id="blockQuotes"/>' +
            '<div id="blockedUsers">' +
            '</div>';
    container.id = "settingsContainer";
    leftBar.appendChild(container);

    blockQuotes = GM_getValue('blockQuotes');
    cbBlockQuotes = document.getElementById('blockQuotes');
    cbBlockQuotes.checked = blockQuotes;
    cbBlockQuotes.addEventListener('click',function(){
        blockQuotes = cbBlockQuotes.checked;
        GM_setValue('blockQuotes',blockQuotes);
    });


    var blockedUsers = GM_getValue('blockedUsers');
    try{
        if(blockedUsers)
            blockedUsers = JSON.parse(blockedUsers);
        else
            blockedUsers = {};
    } catch(e) {
        blockedUsers = {};
    }

    usersdiv = document.getElementById('blockedUsers');
    for(var i in blockedUsers){
        var userDiv = document.createElement('div');
        userDiv.setAttribute('class','user');
        userDiv.setAttribute('id',blockedUsers[i]);

        var userNameSpan = document.createElement('span');
        userNameSpan.textContent = blockedUsers[i];

        var enableButton = document.createElement('input');
        enableButton.setAttribute('type','button');
        enableButton.setAttribute('class','enable');
        (function(i){
            enableButton.addEventListener('click',function() {
                var deleteDiv = document.getElementById(blockedUsers[i]);
                deleteDiv.parentNode.removeChild(deleteDiv);
                delete blockedUsers[i];
                GM_setValue('blockedUsers',JSON.stringify(blockedUsers));
            });
        })(i);
        enableButton.setAttribute('value',"unblock");

        userDiv.appendChild(userNameSpan);
        userDiv.appendChild(enableButton);
        usersdiv.appendChild(userDiv);
    }

    document.getElementById('closeButton').addEventListener('click',function(){
        var settingsContainer = document.getElementById('settingsContainer');
        settingsContainer.parentNode.removeChild(settingsContainer);
    });

    GM_addStyle('' +
        '#settingsContainer {' +
        'background: #FFFFFF;' +
        'border: 1px solid #000000;' +
        'height: 30em;' +
        'position: absolute;' +
        'width: 40ex;' +
        'z-index: 10;' +
        'padding: 10px;' +
        '}' +
        '#settingsContainer > div#blockedUsers {' +
        'max-height: 24em;' +
        'overflow: auto;' +
        'margin-top: 3em;' +
        '}' +
        '.user > span {' +
        'display: inline-block;' +
        'min-width: 25ex;' +
        '}' +
        '#settingsContainer > h1{' +
        'margin-top:0;' +
        '}' +
        '#settingsContainer > .close {' +
        'position: absolute;' +
        'top:.1em;' +
        'right:.1em;' +
        'cursor: pointer;' +
        '}');
}