const DEFAULT_OPTIONS={token:null,updates:{enabled:!0}},Telegram=require("telegram-bot-api"),async=require("async"),overload=require("overload-js"),Telega=function(e){var t=this,n=Object.create(DEFAULT_OPTIONS);"string"==typeof e?n.token=e:"object"==typeof e&&(n=e),this.ACTIONS=["new_chat_member","left_chat_member","new_chat_title","new_chat_photo","group_chat_created","supergroup_chat_created","channel_chat_created","migrate_to_chat_id","migrate_from_chat_id","pinned_message"],this.api=new Telegram(n),this._uses=[],this._actions=[],this._matches=[],this._answers={},this._inlines={},this._cmds={},this._inline=null,this.other={parseMessage:function(e){if(!e)return{};const t=e.split(" ");var n=t[0];const i=t.slice(1),s=i.join(" "),a=n.split("@");var r;return a.length>1&&(n=a[0],r=a[1]),{struct:t,method:n,args:i,search:s,parts:a,target:r}}},this.use=function(e){this._uses.push(e)},this.action=function(e,t){if(-1===this.ACTIONS.indexOf(e))return!1;this._actions.push({type:e,handler:t})},this.match=function(e,t){this._matches.push({regexp:e,handler:t})},this.inline=function(e){this._inline=e},this.cmd=overload().args(String,Function).use(function(e,n){t._cmd(e,null,n)}).args(String,RegExp,Function).use(function(e,n,i){t._cmd(e,n,i)}),this._cmd=function(e,t,n){this._cmds[e]={handler:n,regexp:t}},this.start=function(){this.api.on("message",function(e){t.message(e)}),this.api.on("inline.callback.query",function(e){t.modifyMessage(e);const n=t._inlines[e.chat.id];n&&(n.handler(e),n.many||delete t._inlines[e.chat.id])}),this.api.on("inline.query",function(e){t._inline&&(e.reply=function(n){return t.api.answerInlineQuery({inline_query_id:e.id,results:n.map(function(e){return e.id=Math.random().toString().slice(2),e})})},t._inline(e))}),this.api.getMe().then(function(e){t.username=e.username})},this.modifyMessage=function(e){e.message&&(e.user=e.message.user,e.chat=e.message.chat);const n=this.other.parseMessage(e.text);e.struct=n.struct||[],e.method=n.method||"",e.args=n.args||[],e.search=n.search||"",e.target=n.target||t.username,e.send=function(){return t.api.sendMessage({chat_id:e.chat.id,text:[].join.call(arguments," ")})},e.lines=function(t){return e.send("array"==typeof t?t.join("\n"):[].join.call(arguments,"\n"))},e._inline=function(n,i,s,a){var r=[];return i.forEach(function(e){r[e.row]?r[e.row].push({text:e.text,callback_data:e.data}):r[e.row]=[{text:e.text,callback_data:e.data}]}),t._inlines[e.chat.id]={handler:a,many:s},t.api.sendMessage({chat_id:e.chat.id,text:n,reply_markup:JSON.stringify({inline_keyboard:r})})},e.inline=overload().args(String,Array,Function).use(function(t,n,i){return e._inline(t,n,null,i)}).args(String,Array,Boolean,Function).use(function(t,n,i,s){return e._inline(t,n,i,s)}),e.answer=function(n){t._answers[e.from.id]=n}},this.message=function(e){function n(){const n=t._actions.find(function(t){return-1!==Object.keys(e).indexOf(t.type)});if(n)return e.action_type=n.type,e.action_data=e[n.type],n.handler(e);const i=t._answers[e.from.id];if(i)return i(e),void delete t._answers[e.from.id];const s=t._cmds[e.method.toLowerCase()];if(s){if(e.target!==t.username)return;s.regexp&&(e.matched=e.search.match(s.regexp)),s.handler(e)}else{const a=t._matches.find(function(t){return e.text&&e.text.match(t.regexp)});if(!a)return;a.handler(e)}}e&&(this.modifyMessage(e),async.eachSeries(this._uses,function(t,n){t(e,function(e){n(e||null)})},function(e){if(e)throw e;n()}))}};module.exports=Telega;