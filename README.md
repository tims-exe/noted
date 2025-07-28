|
|-- User Initiates Authentication
|   |-- Via Google Provider
|   |   `-- Redirect to Google -> User Authenticates -> Redirect back to Application
|   |
|   `-- Via Credentials Provider
|       `-- User Enters Email and Password
|           `-- authorize Function
|               |-- If Valid: User Authenticated
|               `-- If Invalid: Error Returned
|
|-- Post-Authentication
|   `-- signIn Callback Triggered
|
|-- Session Creation and Management
|   `-- session Callback Updates Session Information
|
`-- User Access
    `-- User Fully Authenticated and Accesses Application