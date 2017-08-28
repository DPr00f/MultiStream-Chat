/* eslint-disable no-bitwise */
import XMPP from 'stanza.io';
import { getStore } from '../store';

class XMPPChat {
  constructor(propertyToSubscribe) {
    this.propertyToSubscribe = propertyToSubscribe;
    this.onStoreChanged = this.onStoreChanged.bind(this);
    this.store = getStore();
    this.state = this.store.getState();
    this.data = JSON.stringify(this.state[this.propertyToSubscribe]);
    this.store.subscribe(this.onStoreChanged);
    this.joinedRooms = [];
  }

  onStoreChanged() {
    const newState = this.store.getState();
    const newData = JSON.stringify(newState[this.propertyToSubscribe]);
    if (this.data !== newData) {
      this.checkForChanges(newData);
    }
    this.state = newState;
    this.data = newData;
  }

  checkForChanges(newData) {
    const data = JSON.parse(newData);
    data.rooms.forEach(room => {
      if (!~this.joinedRooms.indexOf(room)) {
        this.joinRoom(room);
      }
    });
    this.joinedRooms.forEach(room => {
      if (!~data.rooms.indexOf(room)) {
        this.leaveRoom(room);
      }
    });
  }

  login(opts) {
    this.user = opts.user.name;
    this.password = opts.user.chat.password;
    this.domain = opts.domain;
    this.onConnect = opts.onConnect;
    this.client = XMPP.createClient({
      jid: opts.user.chat.jid,
      password: opts.user.chat.password,
      reconnect: true,
      domain: opts.domain,
      transport: 'websocket',
      wsURL: opts.wsURL
    });
    this.addBindings();
    this.client.connect();
  }

  addBindings() {
    this.client.on('session:started', () => {
      console.log('ooohhhh');
      this.onConnect();
    });

    this.client.on('groupchat', msg => {
      if (msg.delay) {
        msg.oldMessage = true;
      }
      console.log(msg);
      // client.sendMessage({
      //   to: msg.from,
      //   type: 'groupchat',
      //   body: 'You sent: ' + msg.body,
      //   from: 'dpr00fbot@livecoding.tv'
      // });
    });
  }

  joinRoom(roomName) {
    this.client.joinRoom(`${roomName}@${this.domain}`, this.user);
    this.joinedRooms.push(roomName);
  }

  leaveRoom(roomName) {
    this.client.sendPresence({ to: `${roomName}@${this.domain}/${this.user}`, type: 'unavailable' });
    this.joinedRooms.splice(this.joinedRooms.indexOf(roomName), 1);
  }
}

export default XMPPChat;
