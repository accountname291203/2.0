// DOM Elements - Auth & Layout
const authScreen = document.getElementById('auth-screen');
const appLayout = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const authError = document.getElementById('auth-error');
const toggleAuthMode = document.getElementById('toggle-auth-mode');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authHeaderTitle = document.querySelector('.auth-header h2');
const authHeaderDesc = document.querySelector('.auth-header p');

// DOM Elements - App UI
const displayUsername = document.getElementById('display-username');
const settingsUsername = document.getElementById('settings-username');
const settingsUsernameDisplay = document.getElementById('settings-username-display');
const btnSettings = document.getElementById('btn-settings');
const settingsOverlay = document.getElementById('settings-overlay');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnLogout = document.getElementById('btn-logout');
const settingsAvatarBtn = document.getElementById('settings-avatar-btn');

// DOM Elements - Navigation & Chat
const btnHome = document.getElementById('btn-home');
const serverListContainer = document.getElementById('server-list-container');
const dmViewSidebar = document.getElementById('dm-view-sidebar');
const serverViewSidebar = document.getElementById('server-view-sidebar');
const memberSidebar = document.getElementById('member-sidebar');
const chatHeaderInfo = document.getElementById('chat-header-info');
const chatHeaderInvite = document.getElementById('chat-header-invite');
const dmListContainer = document.getElementById('dm-list-container');
const currentServerName = document.getElementById('current-server-name');

const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// DOM Elements - Add Friend Modal
const btnOpenAddFriend = document.getElementById('btn-open-add-friend');
const addFriendModal = document.getElementById('add-friend-modal');
const btnCancelFriend = document.getElementById('btn-cancel-friend');
const btnSubmitFriend = document.getElementById('btn-submit-friend');
const addFriendInput = document.getElementById('add-friend-input');
const addFriendError = document.getElementById('add-friend-error');

// DOM Elements - Add Server Modal
const btnOpenAddServer = document.getElementById('btn-open-add-server');
const addServerModal = document.getElementById('add-server-modal');
const btnCancelServer = document.getElementById('btn-cancel-server');
const tabCreateServer = document.getElementById('tab-create-server');
const tabJoinServer = document.getElementById('tab-join-server');
const formCreateServer = document.getElementById('form-create-server');
const formJoinServer = document.getElementById('form-join-server');

const createServerNameInput = document.getElementById('create-server-name');
const btnSubmitCreateServer = document.getElementById('btn-submit-create-server');
const createServerError = document.getElementById('create-server-error');

const joinServerCodeInput = document.getElementById('join-server-code');
const btnSubmitJoinServer = document.getElementById('btn-submit-join-server');
const joinServerError = document.getElementById('join-server-error');

// DOM Elements - Channel Creation
const serverChannelList = document.getElementById('server-channel-list');
const addChannelModal = document.getElementById('add-channel-modal');
const btnCancelChannel = document.getElementById('btn-cancel-channel');
const btnSubmitChannel = document.getElementById('btn-submit-channel');
const createChannelNameInput = document.getElementById('create-channel-name');

// DOM Elements - Server Control
const serverHeaderBtn = document.getElementById('server-header-btn');
const serverDropdownMenu = document.getElementById('server-dropdown-menu');
const btnLeaveServer = document.getElementById('btn-leave-server');


// App State
let currentUser = null;
let isRegisterMode = false;
let currentChannel = null; 
let activeServerId = null;
let currentServerIsOwner = false;

let unsubscribeMessages = null;
let unsubscribeFriends = null;
let unsubscribeServers = null;
let unsubscribeMembers = null;
let unsubscribeChannels = null;

const FAKE_DOMAIN = "@discordclone.app"; 

const GLOBAL_SERVER = {
    id: "GLOBAL_MAIN",
    name: "Westcord",
    categories: [
        {
            name: "Text Channels",
            channels: [
                { name: "rules" },
                { name: "gaming" },
                { name: "general" },
                { name: "homework" },
                { name: "school 😭" }
            ]
        },
        {
            name: "Games 🔥",
            channels: [
                { name: "roblox" },
                { name: "minecraft" },
                { name: "jailbreak" }
            ]
        },
        {
            name: "Chill \u2304", 
            channels: [
                { name: "songs-that-yall-recommend 🔥 🤑 ✌" },
                { name: "memes 😂" }
            ]
        }
    ]
};

const BANNED_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy'];


// ---------------- Helper ---------------- //
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatChannelName(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-😭🔥🤑✌😂]/g, '');
}

// ---------------- Authentication Logic ---------------- //

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = {
            uid: user.uid,
            name: user.email.replace(FAKE_DOMAIN, ''),
            id: '#' + user.uid.substring(0, 4).toUpperCase()
        };
        
        try {
            const docRef = db.collection('users').doc(user.uid);
            const docSnap = await docRef.get();
            if(docSnap.exists) {
                currentUser.avatarUrl = docSnap.data().avatarUrl || null;
            }
            // Always ensure basic fields exist
            await docRef.set({
                username: currentUser.name,
                uid: user.uid
            }, { merge: true });
        } catch(e) { console.error("Error saving user data:", e); }

        showApp();
    } else {
        currentUser = null;
        if(unsubscribeFriends) unsubscribeFriends();
        if(unsubscribeMessages) unsubscribeMessages();
        if(unsubscribeServers) unsubscribeServers();
        if(unsubscribeMembers) unsubscribeMembers();
        if(unsubscribeChannels) unsubscribeChannels();
        showAuthScreen();
    }
});

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
        authHeaderTitle.textContent = "Create an account";
        authHeaderDesc.textContent = "Join us!";
        authSubmitBtn.textContent = "Register";
        toggleAuthMode.textContent = "Already have an account?";
        document.querySelector('.need-account').style.display = 'none';
    } else {
        authHeaderTitle.textContent = "Welcome back!";
        authHeaderDesc.textContent = "We're so excited to see you again!";
        authSubmitBtn.textContent = "Log In";
        toggleAuthMode.textContent = "Register";
        document.querySelector('.need-account').style.display = 'inline';
    }
    authError.textContent = "";
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    authError.textContent = "";

    if (!username || !password) return;
    const email = username + FAKE_DOMAIN;

    try {
        if (isRegisterMode) {
            await auth.createUserWithEmailAndPassword(email, password);
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        authError.textContent = error.message;
        if (error.code === 'auth/user-not-found' && !isRegisterMode) {
             authError.textContent = "User not found. Please register first.";
        }
    }
});

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        auth.signOut();
        settingsOverlay.classList.add('hidden');
    });
}

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
}

function showApp() {
    authScreen.classList.add('hidden');
    appLayout.classList.remove('hidden');
    
    displayUsername.textContent = currentUser.name;
    document.querySelector('.user-id').textContent = currentUser.id;
    
    settingsUsername.textContent = currentUser.name;
    settingsUsernameDisplay.textContent = `${currentUser.name}${currentUser.id}`;
    
    updateGlobalAvatarUI();
    loadFriends();
    loadServers();
    
    btnHome.click();
}

// ---------------- Settings Overlay & Avatar ---------------- //
if (btnSettings) {
    btnSettings.addEventListener('click', () => { 
        console.log("Settings clicked");
        settingsOverlay.classList.remove('hidden'); 
    });
}
if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', () => { settingsOverlay.classList.add('hidden'); });
}

const avatarCache = {};

async function getUserAvatar(uid) {
    if(avatarCache[uid] !== undefined) return avatarCache[uid];
    
    avatarCache[uid] = null; // Set instantly to avoid duplicate fetches
    try {
        const doc = await db.collection('users').doc(uid).get();
        if(doc.exists && doc.data().avatarUrl) {
            avatarCache[uid] = doc.data().avatarUrl;
            applyGlobalAvatarCSS(uid, avatarCache[uid]);
        }
    } catch(e) {}
    return avatarCache[uid];
}

function applyGlobalAvatarCSS(uid, url) {
    if(!url) return;
    document.querySelectorAll(`.avatar-uid-${uid}`).forEach(el => {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
    });
}

const avatarUploadInput = document.getElementById('avatar-upload-input');

if (settingsAvatarBtn) {
    settingsAvatarBtn.addEventListener('click', () => {
        avatarUploadInput.click();
    });
}

if (avatarUploadInput) {
    avatarUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        // Check file size (limit to ~400KB to stay within Firestore doc limit of 1MB)
        if (file.size > 400000) {
            alert("Image is too large! Please choose a smaller one (under 400KB).");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            try {
                await db.collection('users').doc(currentUser.uid).update({ avatarUrl: base64String });
                currentUser.avatarUrl = base64String;
                avatarCache[currentUser.uid] = base64String;
                
                updateGlobalAvatarUI();
                applyGlobalAvatarCSS(currentUser.uid, base64String);
                
                alert("Avatar uploaded!");
            } catch(err) {
                console.error("Avatar upload err", err);
                alert("Upload failed. Try a smaller image.");
            }
        };
        reader.readAsDataURL(file);
    });
}

function updateGlobalAvatarUI() {
    if(!currentUser || !currentUser.avatarUrl) return;
    const bgString = `url("${currentUser.avatarUrl}")`;
    const bgProps = 'cover';
    
    // Bottom left corner
    const bottomLeftAvatar = document.querySelector('.user-info .avatar');
    if(bottomLeftAvatar) {
        bottomLeftAvatar.style.backgroundImage = bgString;
        bottomLeftAvatar.style.backgroundSize = bgProps;
        bottomLeftAvatar.style.backgroundPosition = 'center';
    }
    
    // Settings menu
    if(settingsAvatarBtn) {
        settingsAvatarBtn.style.backgroundImage = bgString;
        settingsAvatarBtn.style.backgroundSize = bgProps;
        settingsAvatarBtn.style.backgroundPosition = 'center';
    }
}


// ---------------- Adding / Creating Servers ---------------- //
btnOpenAddServer.addEventListener('click', () => {
    addServerModal.classList.remove('hidden');
    createServerError.textContent = '';
    joinServerError.textContent = '';
    createServerNameInput.value = '';
    joinServerCodeInput.value = '';
});
btnCancelServer.addEventListener('click', () => { addServerModal.classList.add('hidden'); });

tabCreateServer.addEventListener('click', () => {
    tabCreateServer.classList.add('active');
    tabJoinServer.classList.remove('active');
    formCreateServer.classList.remove('hidden');
    formJoinServer.classList.add('hidden');
});

tabJoinServer.addEventListener('click', () => {
    tabJoinServer.classList.add('active');
    tabCreateServer.classList.remove('active');
    formJoinServer.classList.remove('hidden');
    formCreateServer.classList.add('hidden');
});

btnSubmitCreateServer.addEventListener('click', async () => {
    const name = createServerNameInput.value.trim();
    if(!name) return;
    
    createServerError.textContent = "Creating...";
    createServerError.style.color = 'var(--text-muted)';
    
    try {
        const inviteCode = generateInviteCode();
        // 1. Create central server doc
        const serverRef = await db.collection('servers').add({
            name: name,
            ownerId: currentUser.uid,
            inviteCode: inviteCode,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 2. Add owner to the server's member list
        await db.collection('servers').doc(serverRef.id).collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });

        // 3. Create default #general channel
        await db.collection('servers').doc(serverRef.id).collection('channels').doc('general').set({
            name: 'general',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 4. Add server to the user's personal list of joined servers
        await db.collection('users').doc(currentUser.uid).collection('userServers').doc(serverRef.id).set({
            name: name,
            inviteCode: inviteCode,
            ownerId: currentUser.uid, 
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        addServerModal.classList.add('hidden');
    } catch(e) {
        console.error(e);
        createServerError.textContent = "Error creating server.";
        createServerError.style.color = 'var(--danger)';
    }
});

btnSubmitJoinServer.addEventListener('click', async () => {
    const code = joinServerCodeInput.value.trim();
    if(!code) return;
    
    joinServerError.textContent = "Searching...";
    joinServerError.style.color = 'var(--text-muted)';
    
    try {
        const query = await db.collection('servers').where('inviteCode', '==', code).get();
        if(query.empty) {
            joinServerError.textContent = "Invalid Invite Code.";
            joinServerError.style.color = 'var(--danger)';
            return;
        }
        
        const serverDoc = query.docs[0];
        const serverId = serverDoc.id;
        const serverData = serverDoc.data();
        
        // 1. Add user to the server's member list
        await db.collection('servers').doc(serverId).collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });

        // 2. Add server to the user's personal list
        await db.collection('users').doc(currentUser.uid).collection('userServers').doc(serverId).set({
            name: serverData.name,
            inviteCode: serverData.inviteCode,
            ownerId: serverData.ownerId, 
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        addServerModal.classList.add('hidden');
    } catch(e) {
        console.error(e);
        joinServerError.textContent = "Error joining server.";
        joinServerError.style.color = 'var(--danger)';
    }
});

function loadServers() {
    if(!currentUser) return;
    
    if(unsubscribeServers) unsubscribeServers();
    
    unsubscribeServers = db.collection('users').doc(currentUser.uid).collection('userServers')
      .onSnapshot(async (snapshot) => {
          // Store active state before clearing
          const currentActiveId = activeServerId;
          serverListContainer.innerHTML = '';
          
          // Persistent Ban Check for Westcord 
          const strikeDoc = await db.collection('users').doc(currentUser.uid).collection('strikes').doc('GLOBAL_MAIN').get();
          const isBanned = strikeDoc.exists && (strikeDoc.data().count || 0) >= 2;

          if (!isBanned) {
              const globalDiv = document.createElement('div');
              globalDiv.className = 'server-icon';
              if(currentActiveId === 'GLOBAL_MAIN') globalDiv.classList.add('active');
              globalDiv.title = GLOBAL_SERVER.name;
              globalDiv.style.backgroundImage = 'url("image.png")';
              globalDiv.style.backgroundSize = 'cover';
              globalDiv.style.backgroundPosition = 'center';
              globalDiv.onclick = () => openServer("GLOBAL_MAIN", GLOBAL_SERVER.name, null, null, globalDiv);
              serverListContainer.appendChild(globalDiv);
          }
          
          snapshot.forEach(doc => {
              const sData = doc.data();
              const serverId = doc.id;
              
              const div = document.createElement('div');
              div.className = 'server-icon';
              if(currentActiveId === serverId) div.classList.add('active');
              div.title = sData.name;
              div.innerHTML = `<span>${sData.name.charAt(0).toUpperCase()}</span>`;
              
              div.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openServer(serverId, sData.name, sData.inviteCode, sData.ownerId, div);
              });
              serverListContainer.appendChild(div);
          });
      });
}

function openServer(serverId, serverName, inviteCode, ownerId, elemNode) {
    btnHome.classList.remove('active');
    document.querySelectorAll('.server-icon').forEach(e => e.classList.remove('active'));
    elemNode.classList.add('active');
    
    serverViewSidebar.classList.remove('hidden');
    dmViewSidebar.classList.add('hidden');
    memberSidebar.style.display = 'block'; 
    currentServerName.textContent = serverName;
    
    if(inviteCode) {
        chatHeaderInvite.innerHTML = `
            <div class="invite-code-pill" onclick="navigator.clipboard.writeText('${inviteCode}'); alert('Copied to clipboard!');" title="Click to copy">
                Invite Code: ${inviteCode}
            </div>
        `;
    } else {
        chatHeaderInvite.innerHTML = '';
        serverHeaderBtn.style.pointerEvents = 'none'; // Lock dropdown on global
    }

    activeServerId = serverId;
    currentServerIsOwner = (currentUser.uid === ownerId);
    serverDropdownMenu.classList.add('hidden'); // Ensure dropdown is closed

    // Configure Dropdown text and permissions
    if(currentServerIsOwner && serverId !== 'GLOBAL_MAIN') {
        btnLeaveServer.innerHTML = `Delete Server 
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15ZM5 6.99902V18.999C5 20.1036 5.89543 20.999 7 20.999H17C18.1046 20.999 19 20.1036 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"/></svg>`;
        serverHeaderBtn.style.pointerEvents = 'auto';
    } else if (serverId !== 'GLOBAL_MAIN') {
        btnLeaveServer.innerHTML = `Leave Server 
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59ZM19 3H5C3.89 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"/></svg>`;
        serverHeaderBtn.style.pointerEvents = 'auto';
    }

    // Dynamic Server Architecture vs Global Hardcode
    if(serverId === 'GLOBAL_MAIN') {
        const catHtml = GLOBAL_SERVER.categories.map((cat, index) => `
            <div class="channel-category" style="justify-content: space-between; margin-top: ${index !== 0 ? '24px' : '0'};">
                <div style="display:flex; align-items:center;">
                    <svg class="arrow" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/></svg>
                    <span>${cat.name}</span>
                </div>
            </div>
            <div class="channel-list">
                ${cat.channels.map(ch => `
                    <div class="channel-item server-channel-item" onclick="openChannel('${serverId}', '${ch.name}')">
                        <svg class="hash" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
                        <span>${ch.name}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
        
        serverChannelList.innerHTML = catHtml;
        
        // Push user into GLOBAL_MAIN members so they show up
        db.collection('servers').doc('GLOBAL_MAIN').collection('members').doc(currentUser.uid).set({
            username: currentUser.name
        });
        
        if(unsubscribeChannels) { unsubscribeChannels(); unsubscribeChannels = null; }
        openChannel(serverId, GLOBAL_SERVER.categories[0].channels[0].name);
        
    } else {
        // Standard dynamic server
        serverChannelList.innerHTML = `
            <div class="channel-category" style="justify-content: space-between;">
                <div style="display:flex; align-items:center;">
                    <svg class="arrow" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/></svg>
                    <span>TEXT CHANNELS</span>
                </div>
                ${currentServerIsOwner ? `
                <div id="btn-open-add-channel" class="add-channel-btn" class="add-channel-btn" title="Create Channel">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
                </div>` : ''}
            </div>
            <div class="channel-list" id="category-default-list"></div>
        `;
        
        const attachAddBtn = document.getElementById('btn-open-add-channel');
        if(attachAddBtn) {
            attachAddBtn.addEventListener('click', () => {
                addChannelModal.classList.remove('hidden');
                createChannelNameInput.value = '';
            });
        }
        
        // Load Dynamic Channel List
        if(unsubscribeChannels) unsubscribeChannels();
        unsubscribeChannels = db.collection('servers').doc(serverId).collection('channels')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snap => {
                const targetList = document.getElementById('category-default-list');
                if(!targetList) return;
                
                targetList.innerHTML = '';
                
                snap.forEach(doc => {
                    const ch = doc.data();
                    const div = document.createElement('div');
                    div.className = `channel-item server-channel-item`;
                    
                    if (currentChannel === `server_${serverId}_${ch.name}`) {
                        div.classList.add('active');
                    }
                    
                    div.innerHTML = `
                        <svg class="hash" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
                        <span>${ch.name}</span>
                    `;
                    div.onclick = () => openChannel(serverId, ch.name);
                    targetList.appendChild(div);
                });
            });
            
        openChannel(serverId, 'general');
    }

    // Load Dynamic member list (works for both GLOBAL and regular since it listens to members subcollection)
    if(unsubscribeMembers) unsubscribeMembers();
    unsubscribeMembers = db.collection('servers').doc(serverId).collection('members').onSnapshot(snap => {
        let membersHTML = `<div class="member-group">MEMBERS — ${snap.size}</div>`;
        snap.forEach(doc => {
            const data = doc.data();
            const memberUid = doc.id;
            const isOwner = (memberUid === ownerId && serverId !== 'GLOBAL_MAIN');
            const crownIcon = isOwner ? 
                `<svg style="margin-left:6px; color:#FAA61A" width="14" height="14" viewBox="0 0 24 24" title="Server Owner"><path fill="currentColor" d="M9.7 2.89c.18-.07.32-.24.37-.43A.97.97 0 0111.95 2A.97.97 0 0114 2.45c.04.2.18.36.36.43a2.3 2.3 0 002.32-.29c.47-.35 1.14-.15 1.34.42l1.63 4.4a.97.97 0 01-.84 1.3L16 8.7a1.36 1.36 0 00-1.15.93l-.86 2.5a.96.96 0 01-1.83 0l-.84-2.45a1.36 1.36 0 00-1.16-.94L7.33 8.7a.97.97 0 01-.84-1.3l1.63-4.4c.2-.56.86-.77 1.34-.41a2.3 2.3 0 002.24.28zM5 14a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>` 
                : '';
                
            membersHTML += `
            <div class="member-item">
                <div class="avatar online avatar-uid-${memberUid}"></div>
                <span class="member-name" style="display:flex; align-items:center;">${data.username}${crownIcon}</span>
            </div>
            `;
            
            getUserAvatar(memberUid);
        });
        memberSidebar.innerHTML = membersHTML;
        
        snap.forEach(doc => {
            if(avatarCache[doc.id]) applyGlobalAvatarCSS(doc.id, avatarCache[doc.id]);
        });
    });
}

function openChannel(serverId, channelName) {
    document.querySelectorAll('.server-channel-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.server-channel-item').forEach(el => {
        if(el.querySelector('span').textContent === channelName) el.classList.add('active');
    });
    
    currentChannel = `server_${serverId}_${channelName}`;
    
    if (channelName === 'rules' && serverId === 'GLOBAL_MAIN') {
        messageForm.classList.add('hidden');
    } else {
        messageForm.classList.remove('hidden');
    }
    
    chatHeaderInfo.innerHTML = `
        <svg class="hash" width="24" height="24" viewBox="0 0 24 24"><path fill="var(--text-muted)" d="M5.8863 21L6.5877 17H3L3.43836 14.4722H7.03425L7.82192 10H4.23425L4.6726 7.47222H8.26027L8.96164 3.47222H11.5479L10.8466 7.47222H15.2219L15.9233 3.47222H18.5096L17.8082 7.47222H21.3959L20.9575 10H17.3616L16.574 14.4722H20.1616L19.7233 17H16.1274L15.426 21H12.8397L13.5411 17H9.16575L8.46438 21H5.8863ZM9.60411 14.4722H14.0041L14.7918 10H10.3918L9.60411 14.4722Z"/></svg>
        <h3 style="margin-left:8px;">${channelName}</h3>
    `;
    
    if (channelName === 'rules' && serverId === 'GLOBAL_MAIN') {
        messageInput.placeholder = "You do not have permission to send messages in this channel.";
        
        // Populate the rules text if empty
        db.collection('channels').doc(currentChannel).collection('messages').get().then(snap => {
            if(snap.empty) {
                const rules = [
                    "1. NO CURSING first and only warning you will get banned if you curse",
                    "2. No spamming you will get muted for 10 minutes",
                    "3. No asking for mod",
                    "4. we will not check dms so do as you please there and do as you please in other servers just not this one",
                    "5. Be respectful"
                ];
                rules.forEach((rule, i) => {
                    db.collection('channels').doc(currentChannel).collection('messages').add({
                        username: "System",
                        uid: "SYSTEM_BOT",
                        text: rule,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        color: "var(--danger)"
                    });
                });
            }
        });
    } else {
        messageInput.placeholder = `Message #${channelName}`;
    }
    
    initChat();
}

// ---------------- Dynamic Channel Creation ---------------- //
if (btnCancelChannel) {
    btnCancelChannel.addEventListener('click', () => {
        addChannelModal.classList.add('hidden');
    });
}

if (btnSubmitChannel) {
    btnSubmitChannel.addEventListener('click', async () => {
        const rawName = createChannelNameInput.value.trim();
        if(!rawName || !activeServerId) return;
        
        const formattedName = formatChannelName(rawName);
        if(!formattedName) return;
    
        try {
            await db.collection('servers').doc(activeServerId).collection('channels').doc(formattedName).set({
                name: formattedName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            addChannelModal.classList.add('hidden');
        } catch(e) {
            console.error("Error creating channel:", e);
        }
    });
}

// ---------------- Server Header Control ---------------- //
serverHeaderBtn.addEventListener('click', () => {
    serverDropdownMenu.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!serverHeaderBtn.contains(e.target) && !serverDropdownMenu.contains(e.target)) {
        serverDropdownMenu.classList.add('hidden');
    }
});

let isProcessingLeave = false;
btnLeaveServer.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if(!activeServerId || !currentUser || isProcessingLeave) return;
    isProcessingLeave = true;
    
    serverDropdownMenu.classList.add('hidden');

    const confirmMsg = currentServerIsOwner ? "Are you sure you want to completely delete this server?" : "Are you sure you want to leave this server?";
    
    if(!window.confirm(confirmMsg)) {
        isProcessingLeave = false;
        return;
    }

    const targetServerId = activeServerId;
    const isOwner = currentServerIsOwner;

    // Immediately route user home to prevent 'onSnapshot' race conditions
    btnHome.click();

    try {
        if(isOwner) {
            // Get all members and bulk-delete their access so the server vanishes from their sidebar in real-time
            const membersSnap = await db.collection('servers').doc(targetServerId).collection('members').get();
            const batch = db.batch();
            membersSnap.forEach(doc => {
                const memberRef = db.collection('users').doc(doc.id).collection('userServers').doc(targetServerId);
                batch.delete(memberRef);
            });
            await batch.commit();

            // Nuke the server
            await db.collection('servers').doc(targetServerId).delete();
        } else {
            // Just leaves the server
            await db.collection('users').doc(currentUser.uid).collection('userServers').doc(targetServerId).delete();
        }
    } catch(err) {
        console.error("Error leaving/deleting server", err);
    } finally {
        isProcessingLeave = false;
    }
});


// ---------------- Navigation (DM vs Server) ---------------- //

btnHome.addEventListener('click', () => {
    btnHome.classList.add('active');
    activeServerId = null;
    document.querySelectorAll('#server-list-container .server-icon').forEach(e => e.classList.remove('active'));
    
    dmViewSidebar.classList.remove('hidden');
    serverViewSidebar.classList.add('hidden');
    memberSidebar.style.display = 'none'; 
    chatHeaderInvite.innerHTML = ''; 
    
    if(unsubscribeMembers) { unsubscribeMembers(); unsubscribeMembers = null; }
    if(unsubscribeChannels) { unsubscribeChannels(); unsubscribeChannels = null; }
    
    if(!currentChannel || !currentChannel.startsWith('dm_')) {
        chatHeaderInfo.innerHTML = `<h3>Direct Messages</h3>`;
        messageList.innerHTML = `<div class="message-welcome"><h1>Your DMs</h1><p>Select a friend to start chatting.</p></div>`;
        messageForm.classList.add('hidden');
    }
});


// ---------------- Friends Logic ---------------- //

function openDM(friendUid, friendName, elem) {
    document.querySelectorAll('.dm-item').forEach(el => el.classList.remove('active'));
    elem.classList.add('active');
    
    const ids = [currentUser.uid, friendUid].sort();
    currentChannel = `dm_${ids[0]}_${ids[1]}`;
    
    messageForm.classList.remove('hidden');
    chatHeaderInvite.innerHTML = '';
    
    chatHeaderInfo.innerHTML = `
        <div class="avatar online dm-header-avatar avatar-uid-${friendUid}" style="width: 24px; height: 24px; margin-right: 8px;"></div>
        <h3>${friendName}</h3>
    `;
    messageInput.placeholder = `Message @${friendName}`;
    
    // Queue avatar load for header
    getUserAvatar(friendUid).then(url => {
        if(url) applyGlobalAvatarCSS(friendUid, url);
    });
    
    initChat();
}

function loadFriends() {
    if(!currentUser) return;
    if(unsubscribeFriends) unsubscribeFriends();
    
    unsubscribeFriends = db.collection('users').doc(currentUser.uid).collection('friends')
      .onSnapshot((snapshot) => {
        dmListContainer.innerHTML = ''; 
        if (snapshot.empty) {
            dmListContainer.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 13px; text-align: center;">No friends yet. Add some!</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const friendId = doc.id;
            const friendData = doc.data();
            const div = document.createElement('div');
            div.className = 'channel-item dm-item';
            div.innerHTML = `
                <div class="avatar online dm-avatar avatar-uid-${friendId}"></div>
                <span>${friendData.username}</span>
            `;
            div.onclick = () => openDM(friendId, friendData.username, div);
            dmListContainer.appendChild(div);
            
            // Queue fetch
            getUserAvatar(friendId).then(url => {
                if(url) applyGlobalAvatarCSS(friendId, url);
            });
        });
    });
}

if (btnOpenAddFriend) {
    btnOpenAddFriend.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
        addFriendInput.value = '';
        addFriendError.textContent = '';
        addFriendError.style.color = 'var(--text-danger)';
    });
}
if (btnCancelFriend) {
    btnCancelFriend.addEventListener('click', () => { addFriendModal.classList.add('hidden'); });
}

btnSubmitFriend.addEventListener('click', async () => {
    const friendName = addFriendInput.value.trim();
    if(!friendName) return;
    
    if(friendName === currentUser.name) {
        addFriendError.textContent = "You can't add yourself!";
        return;
    }

    addFriendError.style.color = 'var(--text-muted)';
    addFriendError.textContent = "Searching...";

    try {
        const querySnapshot = await db.collection('users').where('username', '==', friendName).get();
        if (querySnapshot.empty) {
            addFriendError.style.color = 'var(--danger)';
            addFriendError.textContent = "Hmm, didn't work. Double check that the username is correct.";
        } else {
            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;
            
            await db.collection('users').doc(currentUser.uid).collection('friends').doc(friendId).set({ username: friendName });
            await db.collection('users').doc(friendId).collection('friends').doc(currentUser.uid).set({ username: currentUser.name });
            addFriendModal.classList.add('hidden'); 
        }
    } catch (e) {
        console.error("Error adding friend:", e);
        addFriendError.style.color = 'var(--danger)';
        addFriendError.textContent = "Database error. Make sure your Firestore rules allow searches.";
    }
});

// ---------------- Chat Logic ---------------- //

function createMessageElement(data) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="message-avatar avatar-uid-${data.uid}" style="background-color: ${data.color || 'var(--brand)'}"></div>
        <div class="message-content">
            <div class="message-header">
                <span class="msg-username">${data.username}</span>
                <span class="msg-timestamp">${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
            </div>
            <div class="message-text">${data.text}</div>
        </div>
    `;
    
    // Hydrate the avatar asynchronously without blocking message render
    getUserAvatar(data.uid).then(url => {
        if(url) {
            const avatarDiv = div.querySelector('.message-avatar');
            avatarDiv.style.backgroundImage = `url("${url}")`;
            avatarDiv.style.backgroundSize = 'cover';
            avatarDiv.style.backgroundPosition = 'center';
        }
    });

    return div;
}

function initChat() {
    if (!currentUser || !currentChannel) return;
    if (unsubscribeMessages) unsubscribeMessages();
    
    const isDM = currentChannel.startsWith('dm_');
    const headerTitleElement = chatHeaderInfo.querySelector('h3');
    const headerTitle = headerTitleElement ? headerTitleElement.textContent : 'Welcome!';
    
    messageList.innerHTML = `
        <div class="message-welcome">
            <h1>${isDM ? '@'+headerTitle : 'Welcome to #'+headerTitle+'!'}</h1>
            <p>This is the start of your conversation.</p>
        </div>
    `;

    unsubscribeMessages = db.collection('channels').doc(currentChannel).collection('messages')
      .orderBy('timestamp', 'asc')
      .limitToLast(50)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const msg = change.doc.data();
                const msgEl = createMessageElement(msg);
                messageList.appendChild(msgEl);
                messageList.scrollTop = messageList.scrollHeight; 
            }
        });
      }, (error) => {
          console.error("Firestore error:", error);
      });
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !currentUser || !currentChannel) return;
    
    // Profanity Filter - ONLY for Main Server
    if (activeServerId === 'GLOBAL_MAIN') {
        const lowerText = text.toLowerCase();
        const hasBadWord = BANNED_WORDS.some(word => lowerText.includes(word));
        if (hasBadWord) {
            const strikeRef = db.collection('users').doc(currentUser.uid).collection('strikes').doc('GLOBAL_MAIN');
            const strikeDoc = await strikeRef.get();
            let count = 0;
            if(strikeDoc.exists) count = strikeDoc.data().count || 0;
            
            count++;
            await strikeRef.set({ count: count }, { merge: true });

            if (count >= 2) {
                alert("YOU HAVE BEEN BANNED FROM WESTCORD FOR CURSING.");
                // Remove from sidebar and switch view to Home
                await db.collection('users').doc(currentUser.uid).collection('userServers').doc('GLOBAL_MAIN').delete();
                btnHome.click();
                loadServers(); // Trigger re-render to hide Westcord
                return;
            } else {
                alert("NO CURSING! This is your first and only warning. You will be banned if you curse again.");
                messageInput.value = '';
                return;
            }
        }
    }

    messageInput.value = '';

    try {
        await db.collection('channels').doc(currentChannel).collection('messages').add({
            username: currentUser.name,
            uid: currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            color: '#5865F2'
        });
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send: Check Firebase permissions");
    }
});
