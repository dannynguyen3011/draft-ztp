package zerotrust.authz

import rego.v1

# Default deny
default allow := false

# Allow access if user has valid token and meets policy requirements
allow if {
    is_token_valid
    is_authorized
}

# Check if JWT token is valid
is_token_valid if {
    input.token
    token := io.jwt.decode_verify(input.token, {"secret": input.jwt_secret})
    token[0] # header exists
    token[1] # payload exists
    not is_token_expired(token[1])
}

# Check if token is expired
is_token_expired(payload) if {
    now := time.now_ns() / 1000000000
    payload.exp < now
}

# Main authorization logic
is_authorized if {
    user_roles := get_user_roles
    resource := input.resource
    action := input.action
    
    # Check role-based permissions
    role_permissions[user_roles[_]][resource][action]
}

# Extract user roles from token
get_user_roles := roles if {
    token := io.jwt.decode_verify(input.token, {"secret": input.jwt_secret})
    payload := token[1]
    
    # Get realm roles
    realm_roles := payload.realm_access.roles
    
    # Get client roles (if any)
    client_roles := payload.resource_access[input.client_id].roles
    
    # Combine all roles
    roles := array.concat(realm_roles, client_roles)
}

# Role-based permissions matrix
role_permissions := {
    "manager": {
        "dashboard": {"read": true, "write": true},
        "analytics": {"read": true, "write": false},
        "audit": {"read": true, "write": false},
        "users": {"read": true, "write": true, "delete": true},
        "policies": {"read": true, "write": true, "delete": true},
        "meetings": {"read": true, "write": true, "delete": true},
        "reports": {"read": true, "write": true}
    },
    "employee": {
        "dashboard": {"read": true, "write": false},
        "analytics": {"read": false, "write": false},
        "audit": {"read": false, "write": false},
        "users": {"read": false, "write": false, "delete": false},
        "policies": {"read": true, "write": false, "delete": false},
        "meetings": {"read": true, "write": true, "delete": false},
        "reports": {"read": false, "write": false}
    },
    "admin": {
        "dashboard": {"read": true, "write": true},
        "analytics": {"read": true, "write": true},
        "audit": {"read": true, "write": true},
        "users": {"read": true, "write": true, "delete": true},
        "policies": {"read": true, "write": true, "delete": true},
        "meetings": {"read": true, "write": true, "delete": true},
        "reports": {"read": true, "write": true},
        "system": {"read": true, "write": true, "delete": true}
    }
}

# Context-aware authorization
allow if {
    is_token_valid
    is_context_authorized
}

# Check context-based permissions (time, location, risk)
is_context_authorized if {
    user_roles := get_user_roles
    resource := input.resource
    action := input.action
    
    # Check time-based access
    is_time_allowed(user_roles, resource)
    
    # Check risk-based access
    is_risk_allowed(input.risk_score)
    
    # Check location-based access
    is_location_allowed(input.location, resource)
}

# Time-based access control
is_time_allowed(roles, resource) if {
    "manager" in roles
    # Managers have 24/7 access
}

is_time_allowed(roles, resource) if {
    "employee" in roles
    resource != "audit"
    resource != "system"
    
    # Business hours check
    current_hour := time.clock([time.now_ns(), "UTC"])[0]
    current_hour >= 9
    current_hour <= 17
}

# Risk-based access control
is_risk_allowed(risk_score) if {
    risk_score <= 70  # Allow if risk score is low to medium
}

is_risk_allowed(risk_score) if {
    risk_score > 70
    # High risk requires additional verification
    input.mfa_verified == true
}

# Location-based access control
is_location_allowed(location, resource) if {
    location == "office"  # Office access allowed for all resources
}

is_location_allowed(location, resource) if {
    location == "remote"
    resource != "audit"  # Remote access restricted for audit
    resource != "system"  # Remote access restricted for system admin
    input.vpn_connected == true  # Require VPN for remote access
}

# Data filtering based on roles
filter_data := filtered if {
    user_roles := get_user_roles
    resource := input.resource
    input_data := input.data
    
    # Managers see all data
    "manager" in user_roles
    filtered := input_data
}

filter_data := filtered if {
    user_roles := get_user_roles
    resource := input.resource
    input_data := input.data
    
    # Employees see filtered data
    "employee" in user_roles
    not "manager" in user_roles
    
    # Filter sensitive fields
    filtered := [item |
        item := input_data[_]
        not contains_sensitive_data(item)
    ]
}

# Check if data contains sensitive information
contains_sensitive_data(item) if {
    sensitive_fields := ["salary", "ssn", "personal_data", "audit_logs"]
    sensitive_fields[_] == item.type
} 