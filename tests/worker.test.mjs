import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
test('部署目录拥有独立缓存，更新只清理自己的旧版本',async()=>{
 const source=readFileSync('sw.js','utf8'),deleted=[],keys=['one-leaf-scope:%2FA%2F:5.0.0','one-leaf-scope:%2FA%2F:6.1.0','one-leaf-scope:%2FB%2F:5.0.0','one-leaf-v5'];
 const handlers={},context={URL,Request,self:{location:{href:'https://example.test/A/sw.js',origin:'https://example.test'},clients:{claim:async()=>{}},addEventListener:(k,fn)=>handlers[k]=fn},caches:{keys:async()=>keys,delete:async k=>deleted.push(k)}};vm.createContext(context);vm.runInContext(source,context);let activation;handlers.activate({waitUntil:p=>activation=p});await activation;
 assert.deepEqual(deleted,['one-leaf-scope:%2FA%2F:5.0.0']);assert.ok(vm.runInContext('FILES.every(url=>url.startsWith("https://example.test/A/"))',context));assert.equal(vm.runInContext('CACHE',context),'one-leaf-scope:%2FA%2F:6.1.0');
});
