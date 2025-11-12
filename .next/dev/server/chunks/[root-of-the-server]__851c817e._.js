module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/metadata-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractAgentName",
    ()=>extractAgentName,
    "formatCallTimestamp",
    ()=>formatCallTimestamp,
    "isValidCallFilename",
    ()=>isValidCallFilename,
    "parseCallFilename",
    ()=>parseCallFilename,
    "parseCallFilenames",
    ()=>parseCallFilenames,
    "validateBatch",
    ()=>validateBatch
]);
function parseCallFilename(filename) {
    // Remove .wav extension if present
    const nameWithoutExt = filename.replace(/\.wav$/i, '');
    // Regex pattern to extract metadata
    // Pattern: [LastName, FirstName]_AgentID-Phone_Timestamp(CallID)
    const pattern = /^\[([^,]+),\s*([^\]]+)\]_(\d+)-(\d+)_(\d{14})\((\d+)\)$/;
    const match = nameWithoutExt.match(pattern);
    if (!match) {
        return {
            success: false,
            error: `Invalid filename format. Expected: [LastName, FirstName]_AgentID-Phone_Timestamp(CallID).wav`
        };
    }
    const [, lastName, firstName, agentId, phoneNumber, timestamp, callId] = match;
    // Parse timestamp (format: YYYYMMDDHHmmss)
    const year = parseInt(timestamp.substring(0, 4));
    const month = parseInt(timestamp.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(timestamp.substring(6, 8));
    const hour = parseInt(timestamp.substring(8, 10));
    const minute = parseInt(timestamp.substring(10, 12));
    const second = parseInt(timestamp.substring(12, 14));
    const parsedDate = new Date(year, month, day, hour, minute, second);
    // Validate date
    if (isNaN(parsedDate.getTime())) {
        return {
            success: false,
            error: `Invalid timestamp in filename: ${timestamp}`
        };
    }
    // Construct full agent name
    const agentName = `${firstName.trim()} ${lastName.trim()}`;
    const metadata = {
        agentName,
        agentId: agentId.trim(),
        phoneNumber: phoneNumber.trim(),
        callId: callId.trim(),
        timestamp: parsedDate
    };
    return {
        success: true,
        metadata
    };
}
function isValidCallFilename(filename) {
    const result = parseCallFilename(filename);
    return result.success;
}
function extractAgentName(filename) {
    const result = parseCallFilename(filename);
    return result.success ? result.metadata.agentName : null;
}
function formatCallTimestamp(date) {
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
function parseCallFilenames(filenames) {
    return filenames.map(parseCallFilename);
}
function validateBatch(filenames) {
    const valid = [];
    const invalid = [];
    filenames.forEach((filename)=>{
        const result = parseCallFilename(filename);
        if (result.success) {
            valid.push(filename);
        } else {
            invalid.push({
                filename,
                error: result.error
            });
        }
    });
    return {
        valid,
        invalid,
        totalValid: valid.length,
        totalInvalid: invalid.length
    };
}
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCall",
    ()=>addCall,
    "deleteCall",
    ()=>deleteCall,
    "ensureDirectories",
    ()=>ensureDirectories,
    "fileExists",
    ()=>fileExists,
    "generateCallId",
    ()=>generateCallId,
    "getAnalysis",
    ()=>getAnalysis,
    "getCallById",
    ()=>getCallById,
    "getCompleteCallData",
    ()=>getCompleteCallData,
    "getStorageStats",
    ()=>getStorageStats,
    "getTranscript",
    ()=>getTranscript,
    "getTranscriptText",
    ()=>getTranscriptText,
    "getUploadPath",
    ()=>getUploadPath,
    "readCalls",
    ()=>readCalls,
    "saveAnalysis",
    ()=>saveAnalysis,
    "saveTranscript",
    ()=>saveTranscript,
    "saveTranscriptAsText",
    ()=>saveTranscriptAsText,
    "saveUploadedFile",
    ()=>saveUploadedFile,
    "updateCall",
    ()=>updateCall,
    "writeCalls",
    ()=>writeCalls
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data');
const CALLS_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'calls', 'calls.json');
const UPLOADS_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'uploads');
const TRANSCRIPTS_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'transcripts');
const ANALYSES_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'analyses');
async function ensureDirectories() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'calls'), {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(UPLOADS_DIR, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(TRANSCRIPTS_DIR, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(ANALYSES_DIR, {
        recursive: true
    });
}
async function readCalls() {
    try {
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(CALLS_FILE, 'utf-8');
        const calls = JSON.parse(data);
        // Remove duplicates based on ID (keep first occurrence)
        const seen = new Set();
        const uniqueCalls = calls.filter((call)=>{
            if (seen.has(call.id)) {
                return false;
            }
            seen.add(call.id);
            return true;
        });
        // If duplicates were found, write the deduplicated list back
        if (uniqueCalls.length !== calls.length) {
            console.log(`Removed ${calls.length - uniqueCalls.length} duplicate call(s)`);
            await writeCalls(uniqueCalls);
        }
        // Sort by updatedAt descending (most recent first)
        const sortedCalls = uniqueCalls.sort((a, b)=>{
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA; // Descending order
        });
        return sortedCalls;
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}
// Mutex lock for preventing concurrent writes
let writeQueue = Promise.resolve();
async function writeCalls(calls) {
    // Wait for any pending writes to complete
    await writeQueue;
    // Queue this write operation
    writeQueue = (async ()=>{
        try {
            await ensureDirectories();
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(CALLS_FILE, JSON.stringify(calls, null, 2), 'utf-8');
        } catch (error) {
            console.error('[STORAGE] Failed to write calls:', error);
            throw error;
        }
    })();
    await writeQueue;
}
async function addCall(call) {
    const calls = await readCalls();
    // Check if call already exists
    const existingIndex = calls.findIndex((c)=>c.id === call.id);
    if (existingIndex !== -1) {
        // Update existing call instead of adding duplicate
        calls[existingIndex] = call;
    } else {
        calls.push(call);
    }
    await writeCalls(calls);
    return call;
}
async function getCallById(id) {
    const calls = await readCalls();
    return calls.find((call)=>call.id === id) || null;
}
async function updateCall(id, updates) {
    const calls = await readCalls();
    const index = calls.findIndex((call)=>call.id === id);
    if (index === -1) {
        return null;
    }
    calls[index] = {
        ...calls[index],
        ...updates,
        updatedAt: new Date()
    };
    await writeCalls(calls);
    return calls[index];
}
async function saveUploadedFile(buffer, filename) {
    await ensureDirectories();
    const filepath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, filename);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(filepath, buffer);
    return filepath;
}
function getUploadPath(filename) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, filename);
}
async function fileExists(filename) {
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].access(getUploadPath(filename));
        return true;
    } catch  {
        return false;
    }
}
function generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
async function saveTranscript(transcript) {
    await ensureDirectories();
    const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${transcript.callId}.json`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(jsonPath, JSON.stringify(transcript, null, 2), 'utf-8');
}
async function saveTranscriptAsText(callId, textContent) {
    await ensureDirectories();
    const txtPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(txtPath, textContent, 'utf-8');
}
async function getTranscript(callId) {
    try {
        const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.json`);
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function getTranscriptText(callId) {
    try {
        const txtPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`);
        return await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(txtPath, 'utf-8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function saveAnalysis(analysis) {
    await ensureDirectories();
    const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${analysis.callId}.json`);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(jsonPath, JSON.stringify(analysis, null, 2), 'utf-8');
}
async function getAnalysis(callId) {
    try {
        const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${callId}.json`);
        const data = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function getCompleteCallData(callId) {
    const [call, transcript, analysis] = await Promise.all([
        getCallById(callId),
        getTranscript(callId),
        getAnalysis(callId)
    ]);
    return {
        call,
        transcript,
        analysis
    };
}
async function deleteCall(callId) {
    try {
        // Remove from calls.json
        const calls = await readCalls();
        const filtered = calls.filter((call)=>call.id !== callId);
        await writeCalls(filtered);
        // Delete transcript files
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.json`));
        } catch  {}
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, `${callId}.txt`));
        } catch  {}
        // Delete analysis file
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, `${callId}.json`));
        } catch  {}
        // Delete uploaded audio file (if exists)
        const call = await getCallById(callId);
        if (call?.filename) {
            try {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(getUploadPath(call.filename));
            } catch  {}
        }
        return true;
    } catch (error) {
        console.error('Error deleting call:', error);
        return false;
    }
}
async function getStorageStats() {
    const calls = await readCalls();
    const stats = {
        totalCalls: calls.length,
        uploadedCalls: calls.filter((c)=>c.status === 'pending').length,
        transcribedCalls: calls.filter((c)=>c.status === 'analyzing' || c.status === 'complete').length,
        analyzedCalls: calls.filter((c)=>c.status === 'complete').length,
        errorCalls: calls.filter((c)=>c.status === 'error').length,
        totalStorageBytes: 0
    };
    // Calculate total storage size
    try {
        const transcriptFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(TRANSCRIPTS_DIR);
        const analysisFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(ANALYSES_DIR);
        const uploadFiles = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readdir(UPLOADS_DIR);
        for (const file of transcriptFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(TRANSCRIPTS_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
        for (const file of analysisFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(ANALYSES_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
        for (const file of uploadFiles){
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(UPLOADS_DIR, file));
            stats.totalStorageBytes += stat.size;
        }
    } catch (error) {
        console.error('Error calculating storage size:', error);
    }
    return stats;
}
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/src/lib/audio-compression.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compressAudioIfNeeded",
    ()=>compressAudioIfNeeded,
    "formatBytes",
    ()=>formatBytes
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
;
;
;
const execAsync = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"]);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
async function compressAudioIfNeeded(inputPath, filename) {
    try {
        // Check file size
        const stats = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(inputPath);
        const originalSize = stats.size;
        console.log(`[COMPRESSION] Checking file: ${filename}`);
        console.log(`[COMPRESSION] Input path: ${inputPath}`);
        console.log(`[COMPRESSION] Original size: ${formatBytes(originalSize)} (${originalSize} bytes)`);
        console.log(`[COMPRESSION] Size limit: ${formatBytes(MAX_FILE_SIZE)} (${MAX_FILE_SIZE} bytes)`);
        // If file is under 25MB, no compression needed
        if (originalSize <= MAX_FILE_SIZE) {
            console.log(`[COMPRESSION] ✓ File is under limit, no compression needed`);
            return {
                path: inputPath,
                compressed: false,
                originalSize,
                finalSize: originalSize
            };
        }
        console.log(`[COMPRESSION] ⚠ File exceeds limit by ${formatBytes(originalSize - MAX_FILE_SIZE)}, starting compression...`);
        // Create temporary output path
        const outputPath = inputPath.replace('.wav', '_compressed.wav');
        // FFmpeg command to compress:
        // - Convert to mono (reduces size by ~50% if stereo)
        // - Sample rate: 16kHz (sufficient for speech recognition)
        // - Use MP3 for intermediate compression, then convert back to WAV for Whisper
        const tempMp3 = inputPath.replace('.wav', '_temp.mp3');
        // Step 1: Compress to MP3 (very efficient)
        // Use 32kbps for aggressive compression - perfect for speech
        console.log(`[COMPRESSION] Step 1: Converting to MP3 at 32kbps...`);
        const mp3Command = [
            'ffmpeg',
            '-i',
            `"${inputPath}"`,
            '-ar',
            '16000',
            '-ac',
            '1',
            '-b:a',
            '32k',
            '-y',
            `"${tempMp3}"`
        ].join(' ');
        console.log(`[COMPRESSION] Running: ${mp3Command}`);
        await execAsync(mp3Command);
        const mp3Stats = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(tempMp3);
        console.log(`[COMPRESSION] ✓ MP3 created: ${formatBytes(mp3Stats.size)}`);
        // Step 2: Convert back to WAV for Whisper API
        console.log(`[COMPRESSION] Step 2: Converting MP3 back to WAV...`);
        const wavCommand = [
            'ffmpeg',
            '-i',
            `"${tempMp3}"`,
            '-ar',
            '16000',
            '-ac',
            '1',
            '-sample_fmt',
            's16',
            '-y',
            `"${outputPath}"`
        ].join(' ');
        console.log(`[COMPRESSION] Running: ${wavCommand}`);
        await execAsync(wavCommand);
        // Check compressed file size
        const compressedStats = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(outputPath);
        const finalSize = compressedStats.size;
        console.log(`[COMPRESSION] ✓ Final WAV created: ${formatBytes(finalSize)} (${finalSize} bytes)`);
        // Clean up temp MP3
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(tempMp3).catch(()=>{});
        console.log(`[COMPRESSION] ✓ Temp MP3 cleaned up`);
        const reductionPercent = ((1 - finalSize / originalSize) * 100).toFixed(1);
        console.log(`[COMPRESSION] ========================================\n` + `[COMPRESSION] Compression complete:\n` + `[COMPRESSION]   Original: ${formatBytes(originalSize)} (${originalSize} bytes)\n` + `[COMPRESSION]   Final:    ${formatBytes(finalSize)} (${finalSize} bytes)\n` + `[COMPRESSION]   Saved:    ${formatBytes(originalSize - finalSize)} (${reductionPercent}% reduction)\n` + `[COMPRESSION] ========================================`);
        // Warn if still too large (shouldn't happen with MP3 compression)
        if (finalSize > MAX_FILE_SIZE) {
            console.warn(`Warning: Compressed file is still ${(finalSize / 1024 / 1024).toFixed(2)}MB (over 25MB limit). ` + `This may fail transcription.`);
        }
        // Clean up original file
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(inputPath).catch(()=>{});
        return {
            path: outputPath,
            compressed: true,
            originalSize,
            finalSize
        };
    } catch (error) {
        console.error('Audio compression error:', error);
        throw new Error(`Failed to compress audio: ${error.message}`);
    }
}
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
}),
"[project]/src/app/api/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$metadata$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/metadata-parser.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2d$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audio-compression.ts [app-route] (ecmascript)");
;
;
;
;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB upload limit (will compress to 25MB if needed)
const WHISPER_LIMIT = 25 * 1024 * 1024; // 25MB OpenAI Whisper API limit
const ALLOWED_MIME_TYPES = [
    'audio/wav',
    'audio/x-wav',
    'audio/wave'
];
async function POST(req) {
    try {
        // Get the form data directly
        const formData = await req.formData();
        const files = formData.getAll('files');
        if (!files || files.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'No files provided'
            }, {
                status: 400
            });
        }
        const uploadedCalls = [];
        const errors = [];
        for (const file of files){
            try {
                // Validate file type
                if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                    errors.push(`${file.name}: Invalid file type. Only WAV files are accepted.`);
                    continue;
                }
                // Validate file size (allow up to 50MB, will compress if needed)
                if (file.size > MAX_FILE_SIZE) {
                    errors.push(`${file.name}: File size exceeds 50MB upload limit.`);
                    continue;
                }
                // Parse filename to extract metadata
                const parseResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$metadata$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCallFilename"])(file.name);
                if (!parseResult.success) {
                    errors.push(`${file.name}: ${parseResult.error}`);
                    continue;
                }
                const metadata = parseResult.metadata;
                // Read file buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                // Save file to uploads directory
                let savedPath = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveUploadedFile"])(buffer, file.name);
                // Compress audio if it exceeds Whisper API limit
                const compressionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2d$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressAudioIfNeeded"])(savedPath, file.name);
                let physicalFilename = file.name; // The actual file on disk
                if (compressionResult.compressed) {
                    savedPath = compressionResult.path;
                    physicalFilename = savedPath.split('/').pop() || file.name;
                    console.log(`Compressed ${file.name}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2d$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatBytes"])(compressionResult.originalSize)} → ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2d$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatBytes"])(compressionResult.finalSize)}`);
                }
                // Create call record
                const call = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCallId"])(),
                    filename: physicalFilename,
                    agentName: metadata.agentName,
                    agentId: metadata.agentId,
                    phoneNumber: metadata.phoneNumber,
                    callId: metadata.callId,
                    timestamp: metadata.timestamp,
                    duration: 0,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                // Store call metadata
                const savedCall = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCall"])(call);
                uploadedCalls.push(savedCall);
                // Trigger transcription asynchronously (don't wait)
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transcribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        callId: savedCall.id
                    })
                }).catch((err)=>console.error('Failed to trigger transcription:', err));
            } catch (fileError) {
                errors.push(`${file.name}: ${fileError.message}`);
            }
        }
        // Return response
        if (uploadedCalls.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'No files were successfully uploaded',
                message: errors.join('; ')
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                calls: uploadedCalls,
                errors
            },
            message: `Successfully uploaded ${uploadedCalls.length} file(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`
        }, {
            status: 200
        });
    } catch (error) {
        console.error('Upload error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__851c817e._.js.map