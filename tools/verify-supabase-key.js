#!/usr/bin/env node

/**
 * Script để verify Supabase key type
 * Usage: node verify-supabase-key.js [your-jwt-token]
 */

function decodeJWT(token) {
    try {
        // Split JWT token
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        // Decode payload (second part)
        const payload = parts[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (error) {
        throw new Error(`Failed to decode JWT: ${error.message}`);
    }
}

function verifySupabaseKey(token) {
    const payload = decodeJWT(token);
    
    console.log('🔍 JWT Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log();
    
    const role = payload.role;
    const project = payload.ref;
    
    console.log(`📊 Analysis:`);
    console.log(`Project: ${project}`);
    console.log(`Role: ${role}`);
    
    if (role === 'service_role') {
        console.log('✅ Đây là SERVICE_ROLE key - CÓ quyền upload/delete');
        console.log('✅ Key này phù hợp cho backend operations');
    } else if (role === 'anon') {
        console.log('❌ Đây là ANON key - KHÔNG có quyền upload/delete');
        console.log('❌ Cần thay thế bằng service_role key');
        console.log('💡 Truy cập: Supabase Dashboard → Settings → API → service_role key');
    } else {
        console.log(`⚠️  Role không xác định: ${role}`);
    }
}

// Main execution
const token = process.argv[2];
if (!token) {
    console.log('Usage: node verify-supabase-key.js [your-jwt-token]');
    process.exit(1);
}

try {
    verifySupabaseKey(token);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} 