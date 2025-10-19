import { adminFirestore } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

export async function checkReportRateLimit(request, targetId, targetType) {
  const db = adminFirestore();
  const clientIP = getClientIP(request);
  
  if (clientIP === 'unknown') {
    return {
      allowed: true,
      reason: null
    };
  }
  
  const ipHash = hashIP(clientIP);
  const rateLimitRef = db.collection('reportRateLimits').doc(ipHash);
  
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      
      let reports = [];
      
      if (doc.exists) {
        const data = doc.data();
        reports = data.reports || [];
        
        reports = reports.filter(report => report.timestamp > oneHourAgo);
      }
      
      const reportsInLastHour = reports.filter(r => r.timestamp > oneHourAgo);
      
      if (reportsInLastHour.length >= 5) {
        return {
          allowed: false,
          reason: 'rate_limit_exceeded',
          message: 'You have submitted too many reports. Please try again later.'
        };
      }
      
      const duplicateReport = reports.find(
        r => r.targetId === targetId && r.targetType === targetType
      );
      
      if (duplicateReport) {
        return {
          allowed: false,
          reason: 'duplicate_report',
          message: 'You have already reported this content.'
        };
      }
      
      reports.push({
        targetId,
        targetType,
        timestamp: now
      });
      
      transaction.set(rateLimitRef, {
        reports,
        lastUpdated: new Date(),
        ipHash
      }, { merge: true });
      
      return {
        allowed: true,
        reason: null
      };
    });
    
    return result;
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    
    return {
      allowed: true,
      reason: null
    };
  }
}
