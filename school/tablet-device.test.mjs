import test from 'node:test';
import assert from 'node:assert/strict';
import {usesTabletLayout} from './tablet-device.js';
for(const [name, input, expected] of [
 ['large iPad viewport',{width:1824,userAgent:'iPad'},true],
 ['iPad desktop website mode',{width:1824,platform:'MacIntel',maxTouchPoints:5},true],
 ['desktop monitor remains desktop',{width:1920,platform:'Win32'},false],
 ['tablet sized web preview',{width:1180,platform:'Win32'},true],
 ['phone width preserves mobile rules',{width:640,userAgent:'iPad'},false],
 ['Mac without touch remains desktop',{width:1824,platform:'MacIntel',maxTouchPoints:0},false],
 ['explicit test preview',{width:1824,preview:true},true],
]) test(name,()=>assert.equal(usesTabletLayout(input),expected));