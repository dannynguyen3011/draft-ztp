import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { authLogger } from '@/lib/auth-logger'
import { auth } from '@/lib/auth'
import { logUserActivity } from '@/lib/risk-service'

// Map routes to friendly names
const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/users': 'Users Management', 
  '/dashboard/users/management': 'Users Management',
  '/dashboard/policies': 'Policies',
  '/dashboard/integrations': 'Integrations',
  '/dashboard/audit': 'Audit Logs',
  '/dashboard/access-control': 'Access Control',
  '/dashboard/behavioral-monitoring': 'Behavioral Monitoring',
  '/dashboard/compliance-encryption': 'Compliance & Encryption',
  '/dashboard/incident-response': 'Incident Response',
  '/dashboard/risk-scores': 'Risk Scores',
  '/dashboard/profile': 'Profile',
  '/dashboard/support': 'Support',
  '/dashboard/compliance': 'Compliance',
  '/meetings': 'Meetings',
  '/documentation': 'Documentation',
  '/community': 'Community',
  '/login': 'Login Page',
  '/': 'Home Page'
}

// Get page category for better organization
const getPageCategory = (path: string): string => {
  if (path.startsWith('/dashboard/users')) return 'user_management'
  if (path.startsWith('/dashboard/analytics')) return 'analytics'
  if (path.startsWith('/dashboard/policies')) return 'policy_management'
  if (path.startsWith('/dashboard/integrations')) return 'integrations'
  if (path.startsWith('/dashboard/audit')) return 'audit_management'
  if (path.startsWith('/dashboard/access-control')) return 'access_control'
  if (path.startsWith('/dashboard/behavioral-monitoring')) return 'monitoring'
  if (path.startsWith('/dashboard/compliance')) return 'compliance'
  if (path.startsWith('/dashboard/incident-response')) return 'incident_management'
  if (path.startsWith('/dashboard/risk-scores')) return 'risk_management'
  if (path.startsWith('/dashboard')) return 'dashboard'
  if (path.startsWith('/meetings')) return 'meetings'
  if (path.startsWith('/documentation')) return 'documentation'
  if (path.startsWith('/community')) return 'community'
  if (path === '/login') return 'authentication'
  return 'general'
}

// Calculate risk level based on page sensitivity
const getPageRiskLevel = (path: string): string => {
  // High-risk pages (sensitive data/management)
  if (path.includes('/users/management') || 
      path.includes('/policies') || 
      path.includes('/access-control') ||
      path.includes('/audit')) {
    return 'high'
  }
  
  // Medium-risk pages (monitoring and analytics)
  if (path.includes('/behavioral-monitoring') ||
      path.includes('/analytics') ||
      path.includes('/risk-scores') ||
      path.includes('/incident-response')) {
    return 'medium'
  }
  
  // Low-risk pages (general access)
  return 'low'
}

export const usePageTracking = () => {
  const pathname = usePathname()

  useEffect(() => {
    // Only track if user is authenticated
    if (!auth.isAuthenticated()) {
      return
    }

    // Don't track API routes or static files
    if (pathname.startsWith('/api/') || 
        pathname.includes('._next') || 
        pathname.includes('.')) {
      return
    }

    const pageName = routeNames[pathname] || `Page: ${pathname}`
    const category = getPageCategory(pathname)
    const riskLevel = getPageRiskLevel(pathname)

    // Log page access with risk service (respects admin/manager privileges)
    logUserActivity('page_access', pathname, {
      page: pageName,
      category: category,
      riskLevel: riskLevel,
      referrer: document.referrer || 'direct'
    }).catch(error => {
      console.warn('Failed to log page access with risk service:', error)
    })

    // Also log with auth logger for audit trail
    authLogger.logAuthEvent({
      action: 'page_access',
      success: true,
      riskLevel: riskLevel,
      metadata: {
        page: pageName,
        path: pathname,
        category: category,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      }
    }).catch(error => {
      console.warn('Failed to log page access:', error)
    })

    // Log additional details for sensitive pages
    if (riskLevel === 'high') {
      // Log sensitive page access with risk service
      logUserActivity('sensitive_page_access', pathname, {
        page: pageName,
        securityLevel: 'high_privilege_required',
        accessTime: new Date().toISOString()
      }).catch(error => {
        console.warn('Failed to log sensitive page access with risk service:', error)
      })

      // Also log with auth logger
      authLogger.logAuthEvent({
        action: 'sensitive_page_access',
        success: true,
        riskLevel: 'high',
        metadata: {
          page: pageName,
          path: pathname,
          securityLevel: 'high_privilege_required',
          accessTime: new Date().toISOString()
        }
      }).catch(error => {
        console.warn('Failed to log sensitive page access:', error)
      })
    }

  }, [pathname])

  return {
    currentPage: routeNames[pathname] || pathname,
    category: getPageCategory(pathname),
    riskLevel: getPageRiskLevel(pathname)
  }
}

export default usePageTracking 