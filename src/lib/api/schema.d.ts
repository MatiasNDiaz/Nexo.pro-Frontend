// Archivo generado por scripts/generate-api-types.mjs a partir del OpenAPI del backend.
// No editar a mano: regenerar con `npm run api:types`.

export interface paths {
    "/api/v1/notifications/push/key": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_pushKey_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/push/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_subscribe_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/push/subscriptions/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_unsubscribe_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_preferences_v1"];
        put: operations["NotificationsController_updatePreferences_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_unread_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_read_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_readAll_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/mfa/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_verifyMfa_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logoutAll_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/csrf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_csrfToken_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_listSessions_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["AuthController_closeSession_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions/close-by-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_closeByLink_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/email/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_verifyEmail_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/email/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_resendEmail_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_forgotPassword_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_resetPassword_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password/change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_changePassword_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password/set": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_setPassword_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminAuthController_passwordReset_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GoogleAuthController_start_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GoogleAuthController_callback_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GoogleAuthController_pending_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GoogleAuthController_link_v1"];
        delete: operations["GoogleAuthController_unlink_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/link/email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GoogleAuthController_linkByEmail_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/link/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GoogleAuthController_confirm_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/google/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GoogleAuthController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/locations/provinces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LocationsController_provinces_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/locations/localities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LocationsController_localities_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/locations/neighborhoods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LocationsController_neighborhoodsSearch_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/neighborhoods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminNeighborhoodsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/neighborhoods/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminNeighborhoodsController_approve_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/neighborhoods/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AdminNeighborhoodsController_rename_v1"];
        trace?: never;
    };
    "/api/v1/admin/neighborhoods/{id}/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminNeighborhoodsController_merge_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfessionalsController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProfessionalsController_update_v1"];
        trace?: never;
    };
    "/api/v1/professionals/me/theme": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_setTheme_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/attention-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_setAttention_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/professions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_replaceProfessions_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/service-areas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_replaceServiceAreas_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_addMedia_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/media/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_reorderMedia_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/media/visible": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_chooseVisibleMedia_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/professions/visible": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_chooseVisibleProfessions_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/media/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ProfessionalsController_removeMedia_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/certifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_addCertification_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/certifications/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ProfessionalsController_removeCertification_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/social-links": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_replaceSocialLinks_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ProfessionalsController_replaceAvailability_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/availability/exceptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_addException_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/availability/exceptions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ProfessionalsController_removeException_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/professionals/{userId}/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminProfessionalContentController_profile_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AdminProfessionalContentController_updateProfile_v1"];
        trace?: never;
    };
    "/api/v1/admin/professionals/media/{id}/hide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminProfessionalContentController_hideMedia_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/professionals/media/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminProfessionalContentController_restoreMedia_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/professionals/certifications/{id}/hide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminProfessionalContentController_hideCertification_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/professionals/certifications/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminProfessionalContentController_restoreCertification_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/subscriptions/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SubscriptionsController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["UploadsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/uploads/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["UploadsController_complete_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/uploads/{id}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LocalFilesController_content_v1"];
        put: operations["UploadsController_uploadContent_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_live_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_ready_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfessionsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["UsersController_personal_v1"];
        put?: never;
        post?: never;
        delete: operations["UsersController_deleteMe_v1"];
        options?: never;
        head?: never;
        patch: operations["UsersController_updatePersonal_v1"];
        trace?: never;
    };
    "/api/v1/users/me/avatar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["UsersController_setAvatar_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminPanelController_detail_v1"];
        put?: never;
        post?: never;
        delete: operations["AdminUsersController_delete_v1"];
        options?: never;
        head?: never;
        patch: operations["AdminUsersController_updateData_v1"];
        trace?: never;
    };
    "/api/v1/admin/users/{id}/suspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_suspend_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/ban": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_ban_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_restore_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/change-role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_changeRole_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/revoke-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_revokeSessions_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CustomersController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["CustomersController_update_v1"];
        trace?: never;
    };
    "/api/v1/identity-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["IdentityVerificationController_start_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/identity-verification/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["IdentityVerificationController_getMine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/identity-verifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminIdentityVerificationController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/identity-verifications/{id}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminIdentityVerificationController_decide_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/professionals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_search_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/professionals/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_profile_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/public-page": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OwnPublicPageController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/professionals/me/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MetricsController_mine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminMetricsController_forUser_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ChatController_list_v1"];
        put?: never;
        post: operations["ChatController_open_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/conversations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ChatController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/conversations/{id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ChatController_messages_v1"];
        put?: never;
        post: operations["ChatController_send_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/conversations/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ChatController_read_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/messages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ChatController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["ChatController_edit_v1"];
        trace?: never;
    };
    "/api/v1/chat/attachments/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ChatController_attachment_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RequestsController_mine_v1"];
        put?: never;
        post: operations["RequestsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/received": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RequestsController_received_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RequestsController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RequestsController_cancel_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/targets/{targetId}/decline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RequestsController_decline_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/targets/{targetId}/quotes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RequestsController_quote_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/quotes/{quoteId}/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RequestsController_withdraw_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/requests/targets/{targetId}/select": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RequestsController_select_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ContractsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ContractsController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts/{id}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ContractsController_schedule_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts/{id}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ContractsController_start_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ContractsController_complete_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/contracts/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ContractsController_cancel_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/subscriptions/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PaymentsController_plans_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/subscriptions/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PaymentsController_checkout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/subscriptions/me/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PaymentsController_mine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminPaymentsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/subscriptions/{userId}/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminPaymentsController_changePlan_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ReviewsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews/mine": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ReviewsController_mine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews/received": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ReviewsController_received_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ReviewsController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["ReviewsController_update_v1"];
        trace?: never;
    };
    "/api/v1/reviews/{id}/reply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ReviewsController_reply_v1"];
        post?: never;
        delete: operations["ReviewsController_removeReply_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/professionals/{slug}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PublicReviewsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/platform-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlatformReviewsController_published_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/platform-reviews/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlatformReviewsController_mine_v1"];
        put: operations["PlatformReviewsController_upsert_v1"];
        post?: never;
        delete: operations["PlatformReviewsController_remove_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reviews/{id}/hide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminReviewsController_hide_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reviews/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminReviewsController_restore_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/platform-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminReviewsController_platformReviews_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/platform-reviews/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminReviewsController_publish_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/platform-reviews/{id}/unpublish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminReviewsController_unpublish_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["FavoritesController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/favorites/{professionalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["FavoritesController_save_v1"];
        post?: never;
        delete: operations["FavoritesController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["FavoritesController_setAlerts_v1"];
        trace?: never;
    };
    "/api/v1/forum/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ForumController_list_v1"];
        put?: never;
        post: operations["ForumController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/forum/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ForumController_get_v1"];
        put?: never;
        post?: never;
        delete: operations["ForumController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["ForumController_update_v1"];
        trace?: never;
    };
    "/api/v1/forum/posts/{id}/my-likes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ForumController_myLikes_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/forum/posts/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ForumController_resolve_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/forum/posts/{id}/replies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ForumController_reply_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/forum/replies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ForumController_removeReply_v1"];
        options?: never;
        head?: never;
        patch: operations["ForumController_updateReply_v1"];
        trace?: never;
    };
    "/api/v1/forum/posts/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ForumController_likePost_v1"];
        post?: never;
        delete: operations["ForumController_unlikePost_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/forum/replies/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ForumController_likeReply_v1"];
        post?: never;
        delete: operations["ForumController_unlikeReply_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/forum/posts/{id}/hide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminForumController_hidePost_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/forum/posts/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminForumController_restorePost_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/forum/replies/{id}/hide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminForumController_hideReply_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/forum/replies/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminForumController_restoreReply_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CustomersController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CustomersController_card_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ReportsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/mine": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ReportsController_mine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moderation/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MyModerationController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moderation/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MyModerationController_appeal_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["EvidenceController_content_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminModerationController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminModerationController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports/{id}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_review_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_resolve_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/reports/{id}/conversation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminModerationController_conversation_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/strikes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_addStrike_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/strikes/{id}/void": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_voidStrike_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/sanctions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_sanction_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/sanctions/{id}/lift": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_lift_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminModerationController_appeals_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/appeals/{id}/decide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminModerationController_decide_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support/contact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SupportController_contact_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SupportController_list_v1"];
        put?: never;
        post: operations["SupportController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support/tickets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SupportController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support/tickets/{id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SupportController_reply_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/announcements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnnouncementsController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminSupportController_tickets_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/support/tickets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminSupportController_ticket_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/support/tickets/{id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminSupportController_replyTicket_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/support/tickets/{id}/close": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminSupportController_close_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/announcements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminSupportController_announcementsList_v1"];
        put?: never;
        post: operations["AdminSupportController_publish_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/message": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminSupportController_message_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminPanelController_dashboard_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminPanelController_search_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/revenue/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RevenueController_payments_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/revenue/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RevenueController_registrations_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/revenue/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RevenueController_summary_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/revenue/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RevenueController_export_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        PushKeyDto: {
            /** @description false: el push no está configurado (no ofrecerlo) */
            enabled: boolean;
            /** @description applicationServerKey (base64url) */
            publicKey: string | null;
        };
        PushKeysDto: {
            /** @description Clave pública P-256 del navegador (65 bytes, base64url) */
            p256dh: string;
            /** @description Secreto de autenticación (16 bytes, base64url) */
            auth: string;
        };
        PushSubscribeDto: {
            /** @example https://fcm.googleapis.com/fcm/send/… */
            endpoint: string;
            keys: components["schemas"]["PushKeysDto"];
        };
        PushUnsubscribeDto: {
            endpoint: string;
        };
        NotificationPreferenceDto: {
            /** @enum {string} */
            category: "MESSAGES" | "REQUESTS" | "ACCOUNT" | "COMMUNITY" | "FAVORITES" | "ANNOUNCEMENTS" | "ADMIN_ALERTS";
            /** @description Avisos por push de esta categoría */
            push: boolean;
        };
        UpdatePreferencesDto: {
            preferences: components["schemas"]["NotificationPreferenceDto"][];
        };
        Object: Record<string, never>;
        NeighborhoodInputDto: {
            /** Format: uuid */
            localityId: string;
            /**
             * @description Nombre existente o uno nuevo
             * @example Nueva Córdoba
             */
            name: string;
        };
        ServiceAreaInputDto: {
            /** Format: uuid */
            localityId: string;
            /** @description Si se omite, cubre toda la localidad */
            neighborhoodName?: string;
        };
        RegisterDto: {
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL";
            /** @example ana@example.com */
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            /** @example +5493511234567 */
            phone: string;
            /** @description Obligatorio para clientes */
            neighborhood?: components["schemas"]["NeighborhoodInputDto"];
            /**
             * Format: uuid
             * @description Obligatoria para profesionales
             */
            professionId?: string;
            /** @description Profesionales: 1 a 20 zonas */
            serviceAreas?: components["schemas"]["ServiceAreaInputDto"][];
            /** @description Turnstile: obligatorio cuando el CAPTCHA está activado */
            captchaToken?: string;
        };
        MessageDto: {
            id: string;
            conversationId: string;
            /** @enum {string} */
            senderType: "CUSTOMER" | "PROFESSIONAL" | "SYSTEM";
            senderId: string | null;
            /** @description Vacío si se eliminó */
            body: string;
            edited: boolean;
            deleted: boolean;
            serviceRequestId: string | null;
            attachments: components["schemas"]["AttachmentDto"][];
            /** Format: date-time */
            createdAt: string;
        };
        LoginDto: {
            email: string;
            password: string;
            /** @description Turnstile: solo si la API respondió CAPTCHA_REQUIRED */
            captchaToken?: string;
        };
        MfaVerifyDto: {
            /** @example 123456 */
            code?: string;
            /** @example ABCDE-FGHJK */
            recoveryCode?: string;
        };
        CsrfTokenDto: {
            csrfToken: string;
        };
        MeDto: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            /** @enum {string} */
            status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
            /** @description Motivo, solo si la cuenta está suspendida o baneada (ADR 0007) */
            statusReason: string | null;
            /** @enum {string} */
            verificationStatus: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
            emailVerified: boolean;
            /** @description Foto de perfil (null si no cargó) */
            avatarUrl: string | null;
            /** @description Foto nueva en revisión del admin (ADR 0019); en público se ve avatarUrl */
            pendingAvatarUrl: string | null;
            /** Format: date-time */
            createdAt: string;
            /** @description false en cuentas creadas con Google sin contraseña */
            hasPassword: boolean;
            googleLinked: boolean;
        };
        SessionCsrfDto: {
            csrfToken: string | null;
        };
        SessionSummaryDto: {
            /** @description Id del dispositivo (familia de sesión) */
            id: string;
            current: boolean;
            userAgent: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            lastUsedAt: string | null;
        };
        TokenDto: {
            token: string;
        };
        SessionClosedDto: {
            /** @description false si esa sesión ya estaba cerrada */
            closed: boolean;
        };
        EmailDto: {
            email: string;
        };
        ResetPasswordDto: {
            token: string;
            newPassword: string;
        };
        ChangePasswordDto: {
            currentPassword: string;
            newPassword: string;
        };
        SetPasswordDto: {
            newPassword: string;
        };
        AdminReasonDto: {
            reason: string;
        };
        GooglePendingDto: {
            /** @enum {string} */
            kind: "LINK" | "SIGNUP";
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
        GoogleLinkPasswordDto: {
            password: string;
        };
        CurrentUserDto: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            /** @enum {string} */
            status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
            /** @description Motivo, solo si la cuenta está suspendida o baneada (ADR 0007) */
            statusReason: string | null;
            /** @enum {string} */
            verificationStatus: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
            emailVerified: boolean;
            /** @description Foto de perfil (null si no cargó) */
            avatarUrl: string | null;
            /** @description Foto nueva en revisión del admin (ADR 0019); en público se ve avatarUrl */
            pendingAvatarUrl: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        SessionResponseDto: {
            user: components["schemas"]["CurrentUserDto"];
            csrfToken: string;
        };
        GoogleLinkConfirmDto: {
            /** @description Token del enlace enviado por email */
            token: string;
        };
        GoogleRegisterDto: {
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL";
            firstName: string;
            lastName: string;
            /** @example +5493511234567 */
            phone: string;
            /** @description Obligatorio para clientes */
            neighborhood?: components["schemas"]["NeighborhoodInputDto"];
            /**
             * Format: uuid
             * @description Obligatoria para profesionales
             */
            professionId?: string;
            /** @description Profesionales: 1 a 20 zonas */
            serviceAreas?: components["schemas"]["ServiceAreaInputDto"][];
            /** @description Turnstile: obligatorio cuando el CAPTCHA está activado */
            captchaToken?: string;
        };
        NeighborhoodUsageDto: {
            /** @description Clientes que viven ahí */
            residents: number;
            /** @description Zonas de trabajo de profesionales */
            serviceAreas: number;
        };
        AdminNeighborhoodDto: {
            id: string;
            localityId: string;
            name: string;
            normalizedName: string;
            /** @enum {string} */
            status: "PENDING" | "APPROVED" | "MERGED";
            mergedIntoId: string | null;
            createdByUserId: string | null;
            reviewedById: string | null;
            /** Format: date-time */
            reviewedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            usage: components["schemas"]["NeighborhoodUsageDto"];
        };
        AdminNeighborhoodListDto: {
            data: components["schemas"]["AdminNeighborhoodDto"][];
            total: number;
            page: number;
            limit: number;
        };
        ModerationReasonDto: {
            reason: string;
        };
        RenameNeighborhoodDto: {
            reason?: string;
            /** @description Nombre tal como se va a mostrar (se respetan las mayúsculas) */
            name: string;
        };
        MergeNeighborhoodDto: {
            reason?: string;
            /**
             * Format: uuid
             * @description Barrio APROBADO de la misma localidad
             */
            targetId: string;
        };
        ThemeGradientDto: {
            /** @enum {string} */
            from: "azul" | "celeste" | "turquesa" | "verde" | "lima" | "amarillo" | "naranja" | "rojo" | "rosa" | "violeta" | "gris" | "grafito";
            /** @enum {string} */
            to: "azul" | "celeste" | "turquesa" | "verde" | "lima" | "amarillo" | "naranja" | "rojo" | "rosa" | "violeta" | "gris" | "grafito";
        };
        SectionStyleDto: {
            /** @example #123b7a */
            background?: string;
            /**
             * @description Degradé con `background` (solo Premium)
             * @example #0b1f3a
             */
            backgroundTo?: string;
            /** @example #ffffff */
            text?: string;
            /**
             * @description Escala en %, solo Premium
             * @enum {number}
             */
            size?: 85 | 90 | 95 | 100 | 105 | 110 | 115 | 120 | 125;
            /**
             * @description Solo Premium
             * @enum {string}
             */
            animation?: "aparecer" | "subir" | "costado" | "zoom" | "rebote" | "girar";
        };
        ThemeSectionsDto: {
            pagina?: components["schemas"]["SectionStyleDto"];
            presentacion?: components["schemas"]["SectionStyleDto"];
            datos?: components["schemas"]["SectionStyleDto"];
            sobre?: components["schemas"]["SectionStyleDto"];
            trabajos?: components["schemas"]["SectionStyleDto"];
            certificados?: components["schemas"]["SectionStyleDto"];
            resenas?: components["schemas"]["SectionStyleDto"];
            contacto?: components["schemas"]["SectionStyleDto"];
            zonas?: components["schemas"]["SectionStyleDto"];
            horarios?: components["schemas"]["SectionStyleDto"];
            redes?: components["schemas"]["SectionStyleDto"];
        };
        ProfileThemeDto: {
            /** @enum {string} */
            color?: "azul" | "celeste" | "turquesa" | "verde" | "lima" | "amarillo" | "naranja" | "rojo" | "rosa" | "violeta" | "gris" | "grafito";
            gradient?: components["schemas"]["ThemeGradientDto"];
            /** @enum {string} */
            font?: "moderna" | "clasica" | "redondeada" | "manuscrita";
            headline?: string;
            /**
             * @description Solo Premium
             * @enum {string}
             */
            animation?: "aparecer" | "deslizar" | "zoom" | "rebote";
            /** @description Estilo por sección (ADR 0034). Medium: fondo y letra; Premium: además degradé, tamaño y animación */
            sections?: components["schemas"]["ThemeSectionsDto"];
        };
        AttentionDto: {
            /**
             * @description Estado elegido a mano
             * @enum {string}
             */
            manual: "AVAILABLE" | "WORKING" | "RESTING";
            /** Format: date-time */
            until: string | null;
            autoFromSchedule: boolean;
            /**
             * @description Estado que se muestra ahora
             * @enum {string}
             */
            effective: "AVAILABLE" | "WORKING" | "RESTING";
        };
        ProfessionItemDto: {
            id: string;
            name: string;
            isPrimary: boolean;
            /** @enum {string} */
            status: "ACTIVE" | "HIDDEN_BY_PLAN";
        };
        ServiceAreaItemDto: {
            localityId: string;
            localityName: string;
            /** @description null = toda la localidad */
            neighborhoodId: string | null;
            neighborhoodName: string | null;
        };
        MediaItemDto: {
            id: string;
            fileId: string;
            /** @enum {string} */
            purpose: "PRESENTATION" | "WORK" | "CATALOG_VIDEO" | "PROFILE_VIDEO" | "BANNER";
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO";
            position: number;
            /** @enum {string} */
            status: "ACTIVE" | "HIDDEN_BY_PLAN" | "HIDDEN_BY_ADMIN";
            url: string | null;
            hiddenReason: string | null;
        };
        CertificationItemDto: {
            id: string;
            title: string;
            institution: string | null;
            issuedYear: number | null;
            /** @enum {string} */
            kind: "IMAGE" | "DOCUMENT";
            /** @enum {string} */
            status: "ACTIVE" | "HIDDEN_BY_ADMIN";
            url: string | null;
            /** @description Siempre false: "certificado cargado por el profesional" (ADR 0020) */
            verified: boolean;
            hiddenReason: string | null;
        };
        SocialLinkDto: {
            /** @enum {string} */
            network: "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "LINKEDIN" | "YOUTUBE" | "WEBSITE";
            url: string;
        };
        AvailabilitySlotDto: {
            weekday: number;
            start: string;
            end: string;
        };
        AvailabilityExceptionDto: {
            id: string;
            startDate: string;
            endDate: string;
            /** @enum {string} */
            type: "DAY_OFF" | "HOLIDAY" | "VACATION";
            note: string | null;
        };
        AvailabilityDto: {
            slots: components["schemas"]["AvailabilitySlotDto"][];
            /** @description Las que no terminaron */
            exceptions: components["schemas"]["AvailabilityExceptionDto"][];
        };
        ProfessionalMeDto: {
            id: string;
            slug: string;
            businessName: string | null;
            bio: string | null;
            yearsExperience: number | null;
            worksWithTeam: boolean;
            hasMobility: boolean;
            /** @description Decimal como texto */
            referenceRate: string | null;
            /** @enum {string|null} */
            rateMode: "PER_VISIT" | "PER_HOUR" | "PER_JOB" | null;
            freeQuote: boolean;
            theme: components["schemas"]["ProfileThemeDto"];
            attention: components["schemas"]["AttentionDto"];
            professions: components["schemas"]["ProfessionItemDto"][];
            serviceAreas: components["schemas"]["ServiceAreaItemDto"][];
            media: components["schemas"]["MediaItemDto"][];
            certifications: components["schemas"]["CertificationItemDto"][];
            socialLinks: components["schemas"]["SocialLinkDto"][];
            availability: components["schemas"]["AvailabilityDto"];
        };
        UpdateProfessionalProfileDto: {
            businessName?: Record<string, never> | null;
            /** @description Descripción (FI §7.1) */
            bio?: Record<string, never> | null;
            yearsExperience?: Record<string, never> | null;
            worksWithTeam?: boolean;
            hasMobility?: boolean;
            freeQuote?: boolean;
            autoStatusFromSchedule?: boolean;
            /** @description Tarifa de referencia en ARS. Va junto con rateMode (los dos o ninguno). */
            referenceRate?: Record<string, never> | null;
            /** @enum {string|null} */
            rateMode?: "PER_VISIT" | "PER_HOUR" | "PER_JOB" | null;
        };
        AttentionStatusDto: {
            /** @enum {string} */
            status: "AVAILABLE" | "WORKING" | "RESTING";
            /** @description Hasta cuándo vale (máximo 7 días). Sin fecha, vale hasta que lo cambie. */
            until?: Record<string, never> | null;
        };
        ReplaceProfessionsDto: {
            /** @description Entre 1 y lo que permita el plan */
            professionIds: string[];
            /**
             * Format: uuid
             * @description Profesión principal (una de las anteriores)
             */
            primaryId: string;
        };
        ReplaceServiceAreasDto: {
            serviceAreas: components["schemas"]["ServiceAreaInputDto"][];
        };
        AddMediaDto: {
            /**
             * Format: uuid
             * @description Archivo PROFILE_MEDIA propio, confirmado
             */
            fileId: string;
            /**
             * @description Imagen: PRESENTATION, WORK o BANNER. Video: CATALOG_VIDEO, PROFILE_VIDEO o BANNER.
             * @enum {string}
             */
            purpose: "PRESENTATION" | "WORK" | "CATALOG_VIDEO" | "PROFILE_VIDEO" | "BANNER";
        };
        ReorderMediaDto: {
            /** @description Todos los ids de medios, en el orden nuevo */
            ids: string[];
        };
        VisibleMediaDto: {
            /** @description Ids de las imágenes y videos a mostrar */
            ids: string[];
        };
        VisibleProfessionsDto: {
            /** @description Ids de las profesiones a mostrar (con la principal) */
            professionIds: string[];
        };
        AddCertificationDto: {
            /**
             * Format: uuid
             * @description Archivo CERTIFICATE propio, confirmado
             */
            fileId: string;
            title: string;
            institution?: string;
            issuedYear?: number;
            /** @description Obligatorio (ADR 0020): el documento no muestra DNI, dirección ni fecha de nacimiento, o están tapados. */
            sensitiveDataConfirmed: boolean;
        };
        SocialLinkInputDto: {
            /** @enum {string} */
            network: "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "LINKEDIN" | "YOUTUBE" | "WEBSITE";
            /** @description https y del dominio de esa red */
            url: string;
        };
        ReplaceSocialLinksDto: {
            /** @description Una por red; lista vacía = ninguna */
            links: components["schemas"]["SocialLinkInputDto"][];
        };
        AvailabilitySlotInputDto: {
            /** @description 1 = lunes … 7 = domingo */
            weekday: number;
            /** @example 08:00 */
            start: string;
            /** @example 18:00 */
            end: string;
        };
        ReplaceAvailabilityDto: {
            /** @description Hora de Córdoba */
            slots: components["schemas"]["AvailabilitySlotInputDto"][];
        };
        AddAvailabilityExceptionDto: {
            /** @example 2026-12-24 */
            startDate: string;
            /** @example 2026-12-26 */
            endDate: string;
            /** @enum {string} */
            type: "DAY_OFF" | "HOLIDAY" | "VACATION";
            note?: string;
        };
        AdminUpdateProfessionalProfileDto: {
            businessName?: Record<string, never> | null;
            /** @description Descripción (FI §7.1) */
            bio?: Record<string, never> | null;
            yearsExperience?: Record<string, never> | null;
            worksWithTeam?: boolean;
            hasMobility?: boolean;
            freeQuote?: boolean;
            autoStatusFromSchedule?: boolean;
            /** @description Tarifa de referencia en ARS. Va junto con rateMode (los dos o ninguno). */
            referenceRate?: Record<string, never> | null;
            /** @enum {string|null} */
            rateMode?: "PER_VISIT" | "PER_HOUR" | "PER_JOB" | null;
            reason: string;
        };
        HideContentDto: {
            /** @description Motivo (auditado) */
            reason: string;
        };
        PlanLimitsDto: {
            code: string;
            name: string;
            maxProfessions: number;
            maxImages: number;
            maxVideos: number;
            maxVideoSeconds: number;
            maxImageBytes: number;
            maxVideoBytes: number;
            /** @enum {string} */
            themeLevel: "NONE" | "STANDARD" | "EXTENDED";
        };
        SubscriptionSummaryDto: {
            /** @enum {string|null} */
            status: "TRIAL" | "ACTIVE" | "EXPIRED" | null;
            /** @description true si la prueba o el plan están vigentes */
            live: boolean;
            plan: components["schemas"]["PlanLimitsDto"] | null;
            /** Format: date-time */
            trialEndsAt: string | null;
            /** @description Contador de la prueba (ADR 0017): 30 al registrarse, 1 el último día */
            trialDaysLeft: number | null;
            /**
             * Format: date-time
             * @description Hasta cuándo está pago (incluye los meses pagados por adelantado)
             */
            currentPeriodEnd: string | null;
            /** @description Días que quedan del período pago */
            periodDaysLeft: number | null;
        };
        CreateUploadDto: {
            /** @enum {string} */
            purpose: "AVATAR" | "PROFILE_MEDIA" | "CERTIFICATE" | "CHAT_ATTACHMENT" | "FORUM_MEDIA" | "EVIDENCE";
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO" | "DOCUMENT";
        };
        FileResponseDto: {
            id: string;
            /** @enum {string} */
            purpose: "AVATAR" | "PROFILE_MEDIA" | "CERTIFICATE" | "CHAT_ATTACHMENT" | "FORUM_MEDIA" | "EVIDENCE";
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO" | "DOCUMENT";
            /** @enum {string} */
            status: "PENDING_UPLOAD" | "READY" | "REJECTED" | "DELETED";
            mimeType: string | null;
            sizeBytes: number | null;
            durationMs: number | null;
            /** @description URL pública si el archivo está listo. Con el adaptador local es una ruta de la API (anteponer su origen). */
            url: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        UploadTicketDto: {
            /** @enum {string} */
            method: "POST" | "PUT";
            /** @description Destino de la subida (Cloudinary o, en desarrollo, la propia API) */
            url: string;
            /** @description Campos multipart que acompañan al archivo (campo `file`). No modificarlos. */
            fields: {
                [key: string]: string;
            };
            maxBytes: number;
            /** Format: date-time */
            expiresAt: string;
        };
        CreateUploadResponseDto: {
            file: components["schemas"]["FileResponseDto"];
            upload: components["schemas"]["UploadTicketDto"];
        };
        PersonalDataDto: {
            id: string;
            /** @description Nombre vigente (el que se ve en público) */
            firstName: string;
            lastName: string;
            /** @description Nombre en revisión (ADR 0021) */
            pendingFirstName: string | null;
            pendingLastName: string | null;
            phone: string;
            neighborhoodId: string | null;
            neighborhoodName: string | null;
        };
        UpdatePersonalDataDto: {
            /** @description Con la identidad aprobada queda en revisión del admin (ADR 0021) */
            firstName?: string;
            lastName?: string;
            /** @example +5493511234567 */
            phone?: string;
            /** @description Solo clientes: barrio donde vive */
            neighborhood?: components["schemas"]["NeighborhoodInputDto"];
        };
        SetAvatarDto: {
            /**
             * Format: uuid
             * @description Archivo AVATAR propio, ya confirmado (READY)
             */
            fileId: string;
        };
        AvatarResponseDto: {
            id: string;
            /** @enum {string} */
            purpose: "AVATAR" | "PROFILE_MEDIA" | "CERTIFICATE" | "CHAT_ATTACHMENT" | "FORUM_MEDIA" | "EVIDENCE";
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO" | "DOCUMENT";
            /** @enum {string} */
            status: "PENDING_UPLOAD" | "READY" | "REJECTED" | "DELETED";
            mimeType: string | null;
            sizeBytes: number | null;
            durationMs: number | null;
            /** @description URL pública si el archivo está listo. Con el adaptador local es una ruta de la API (anteponer su origen). */
            url: string | null;
            /** Format: date-time */
            createdAt: string;
            underReview: boolean;
        };
        DeleteOwnAccountDto: {
            password?: string;
        };
        AdminUpdatePersonalDataDto: {
            /** @description Con la identidad aprobada queda en revisión del admin (ADR 0021) */
            firstName?: string;
            lastName?: string;
            /** @example +5493511234567 */
            phone?: string;
            /** @description Solo clientes: barrio donde vive */
            neighborhood?: components["schemas"]["NeighborhoodInputDto"];
            /** @description Solo clientes */
            extraInfo?: Record<string, never> | null;
            reason: string;
        };
        SuspendAccountDto: {
            reason: string;
            /** @description Fecha de fin: la suspensión se levanta sola */
            endsAt?: string;
            /**
             * Format: uuid
             * @description Reporte que la originó
             */
            reportId?: string;
        };
        AccountSummaryDto: {
            id: string;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            /** @enum {string} */
            status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
        };
        BanAccountDto: {
            reason: string;
            /**
             * Format: uuid
             * @description Reporte que lo originó
             */
            reportId?: string;
        };
        AccountActionDto: {
            reason: string;
        };
        ChangeRoleDto: {
            reason: string;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL";
            neighborhood?: components["schemas"]["NeighborhoodInputDto"];
            /** Format: uuid */
            professionId?: string;
            serviceAreas?: components["schemas"]["ServiceAreaInputDto"][];
        };
        CustomerProfileDto: {
            extraInfo: string | null;
        };
        UpdateCustomerProfileDto: {
            /** @description Datos útiles para el profesional */
            extraInfo?: Record<string, never> | null;
        };
        StartVerificationResponseDto: {
            id: string | null;
            /**
             * @description IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021)
             * @enum {string|null}
             */
            kind: "IDENTITY" | "PROFILE_CHANGE" | null;
            /** @enum {string} */
            status: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
            provider: string | null;
            attemptNumber: number;
            submittedAt: string | null;
            decidedAt: string | null;
            reasonCode: string | null;
            /** @description true si ya había un intento abierto y se devolvió ese */
            alreadyInProgress: boolean;
            redirectUrl: string | null;
            clientToken: string | null;
            /** @description true en modo manual: el admin se va a contactar con el usuario */
            manualReview: boolean;
        };
        VerificationResponseDto: {
            id: string | null;
            /**
             * @description IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021)
             * @enum {string|null}
             */
            kind: "IDENTITY" | "PROFILE_CHANGE" | null;
            /** @enum {string} */
            status: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
            provider: string | null;
            attemptNumber: number;
            submittedAt: string | null;
            decidedAt: string | null;
            reasonCode: string | null;
        };
        VerificationSubjectDto: {
            id: string;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            avatarUrl: string | null;
            /** @description Nombre nuevo en revisión (ADR 0021) */
            pendingFirstName: string | null;
            pendingLastName: string | null;
            /** @description Foto nueva en revisión (ADR 0019) */
            pendingAvatarUrl: string | null;
        };
        AdminVerificationResponseDto: {
            id: string | null;
            /**
             * @description IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021)
             * @enum {string|null}
             */
            kind: "IDENTITY" | "PROFILE_CHANGE" | null;
            /** @enum {string} */
            status: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
            provider: string | null;
            attemptNumber: number;
            submittedAt: string | null;
            decidedAt: string | null;
            reasonCode: string | null;
            userId: string;
            decisionSource: string | null;
            decidedBy: string | null;
            adminNote: string | null;
            subject?: components["schemas"]["VerificationSubjectDto"];
        };
        PaginationMetaDto: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        AdminVerificationListDto: {
            data: components["schemas"]["AdminVerificationResponseDto"][];
            meta: components["schemas"]["PaginationMetaDto"];
        };
        AdminDecisionDto: {
            /** @enum {string} */
            decision: "APPROVE" | "REJECT" | "REVOKE";
            reason: string;
            /** @description Código corto visible para el usuario, p. ej. DOCUMENT_MISMATCH */
            reasonCode?: string;
            /** @description Cómo se verificó (videollamada, presencial…). Interno: el usuario no lo ve. */
            adminNote?: string;
        };
        PublicProfessionDto: {
            id: string;
            name: string;
            isPrimary: boolean;
        };
        PublicAreaDto: {
            localityId: string;
            localityName: string;
            /** @description null = toda la localidad */
            neighborhoodId: string | null;
            neighborhoodName: string | null;
        };
        CatalogItemDto: {
            slug: string;
            /**
             * Format: uuid
             * @description Id de usuario del profesional: el que piden chat, favoritos, solicitudes y reportes de perfil
             */
            professionalUserId: string;
            firstName: string;
            lastName: string;
            businessName: string | null;
            avatarUrl: string | null;
            bio: string | null;
            yearsExperience: number | null;
            referenceRate: string | null;
            /** @enum {string|null} */
            rateMode: "PER_VISIT" | "PER_HOUR" | "PER_JOB" | null;
            freeQuote: boolean;
            /**
             * @description Estado que se muestra ahora
             * @enum {string}
             */
            attentionStatus: "AVAILABLE" | "WORKING" | "RESTING";
            /** @description Siempre true en el catálogo (solo muestra identidades aprobadas); en la vista previa del dueño, el estado real */
            identityVerified: boolean;
            professions: components["schemas"]["PublicProfessionDto"][];
            serviceAreas: components["schemas"]["PublicAreaDto"][];
            /** @description Primera imagen de presentación */
            coverImageUrl: string | null;
            /** @description Video de presentación en catálogo */
            catalogVideoUrl: string | null;
            /** @description Promedio de estrellas (un decimal) */
            ratingAverage: number | null;
            /** @description Cantidad de reseñas visibles */
            ratingCount: number;
        };
        CatalogPageDto: {
            data: components["schemas"]["CatalogItemDto"][];
            page: number;
            limit: number;
            total: number;
        };
        PublicMediaDto: {
            /** @enum {string} */
            purpose: "PRESENTATION" | "WORK" | "CATALOG_VIDEO" | "PROFILE_VIDEO" | "BANNER";
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO";
            url: string;
        };
        PublicCertificationDto: {
            title: string;
            institution: string | null;
            issuedYear: number | null;
            /** @enum {string} */
            kind: "IMAGE" | "DOCUMENT";
            url: string;
            /** @description Siempre false: "certificado cargado por el profesional" (ADR 0020) */
            verified: boolean;
        };
        PublicSocialLinkDto: {
            /** @enum {string} */
            network: "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "LINKEDIN" | "YOUTUBE" | "WEBSITE";
            url: string;
        };
        PublicAvailabilityDto: {
            /** @description 1 = lunes … 7 = domingo; hora de Córdoba */
            slots: string[];
            /** @description Próximos días sin atención */
            exceptions: string[];
        };
        PublicProfileDto: {
            slug: string;
            /**
             * Format: uuid
             * @description Id de usuario del profesional: el que piden chat, favoritos, solicitudes y reportes de perfil
             */
            professionalUserId: string;
            firstName: string;
            lastName: string;
            businessName: string | null;
            avatarUrl: string | null;
            bio: string | null;
            yearsExperience: number | null;
            referenceRate: string | null;
            /** @enum {string|null} */
            rateMode: "PER_VISIT" | "PER_HOUR" | "PER_JOB" | null;
            freeQuote: boolean;
            /**
             * @description Estado que se muestra ahora
             * @enum {string}
             */
            attentionStatus: "AVAILABLE" | "WORKING" | "RESTING";
            /** @description Siempre true en el catálogo (solo muestra identidades aprobadas); en la vista previa del dueño, el estado real */
            identityVerified: boolean;
            professions: components["schemas"]["PublicProfessionDto"][];
            serviceAreas: components["schemas"]["PublicAreaDto"][];
            /** @description Primera imagen de presentación */
            coverImageUrl: string | null;
            /** @description Video de presentación en catálogo */
            catalogVideoUrl: string | null;
            /** @description Promedio de estrellas (un decimal) */
            ratingAverage: number | null;
            /** @description Cantidad de reseñas visibles */
            ratingCount: number;
            worksWithTeam: boolean;
            hasMobility: boolean;
            email: string;
            phone: string;
            /** @description Solo lo que admite su plan actual */
            theme: components["schemas"]["ProfileThemeDto"];
            banner: components["schemas"]["PublicMediaDto"] | null;
            media: components["schemas"]["PublicMediaDto"][];
            certifications: components["schemas"]["PublicCertificationDto"][];
            socialLinks: components["schemas"]["PublicSocialLinkDto"][];
            availability: components["schemas"]["PublicAvailabilityDto"];
        };
        OwnPublicPageDto: {
            /** @description true si cualquiera puede verla (y compartir el enlace) */
            published: boolean;
            /** @description Lo que falta para publicarla, en el orden en que conviene resolverlo */
            missing: ("ACCOUNT_NOT_ACTIVE" | "ACCOUNT_RESTRICTED" | "IDENTITY_NOT_VERIFIED" | "NO_AVATAR" | "NO_BIO" | "NO_PROFESSION" | "NO_SERVICE_AREA" | "NO_LIVE_PLAN" | "PROFILE_DEACTIVATED" | "PROFILE_HIDDEN")[];
            /** @description Cómo se ve (o se vería) publicada */
            profile: components["schemas"]["PublicProfileDto"];
        };
        MetricsBucketDto: {
            /** @description Personas distintas que abrieron el perfil (por día, sumadas) */
            profileViewers: number;
            /** @description Personas distintas que lo vieron en resultados (por día, sumadas) */
            searchAppearances: number;
            /** @description Veces que estuvo primero en la primera página (personas por día) */
            firstPlace: number;
            /** @description Pedidos que le llegaron */
            requests: number;
            /** @description Trabajos terminados */
            completed: number;
            /** @description Reseñas recibidas */
            ratingCount: number;
            /** @description Promedio de esas reseñas (1 a 5) */
            ratingAverage: number | null;
            /**
             * @description Comienzo del período
             * @example 2026-11-01
             */
            start: string;
        };
        MetricsValuesDto: {
            /** @description Personas distintas que abrieron el perfil (por día, sumadas) */
            profileViewers: number;
            /** @description Personas distintas que lo vieron en resultados (por día, sumadas) */
            searchAppearances: number;
            /** @description Veces que estuvo primero en la primera página (personas por día) */
            firstPlace: number;
            /** @description Pedidos que le llegaron */
            requests: number;
            /** @description Trabajos terminados */
            completed: number;
            /** @description Reseñas recibidas */
            ratingCount: number;
            /** @description Promedio de esas reseñas (1 a 5) */
            ratingAverage: number | null;
        };
        MetricsPreviousDto: {
            /** @description Personas distintas que abrieron el perfil (por día, sumadas) */
            profileViewers: number;
            /** @description Personas distintas que lo vieron en resultados (por día, sumadas) */
            searchAppearances: number;
            /** @description Veces que estuvo primero en la primera página (personas por día) */
            firstPlace: number;
            /** @description Pedidos que le llegaron */
            requests: number;
            /** @description Trabajos terminados */
            completed: number;
            /** @description Reseñas recibidas */
            ratingCount: number;
            /** @description Promedio de esas reseñas (1 a 5) */
            ratingAverage: number | null;
            from: string;
            to: string;
        };
        OverallRatingDto: {
            count: number;
            average: number | null;
        };
        ProfessionalMetricsDto: {
            from: string;
            to: string;
            /** @enum {string} */
            groupBy: "day" | "week" | "month";
            buckets: components["schemas"]["MetricsBucketDto"][];
            total: components["schemas"]["MetricsValuesDto"];
            /** @description Mismo tramo, un período antes */
            previous: components["schemas"]["MetricsPreviousDto"];
            /** @description Todas sus reseñas visibles */
            overallRating: components["schemas"]["OverallRatingDto"];
        };
        OpenConversationDto: {
            /**
             * Format: uuid
             * @description Usuario del profesional (visible en el catálogo)
             */
            professionalId: string;
        };
        CounterpartDto: {
            userId: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            /** @description true si dio de baja su cuenta: el chat queda de solo lectura. Anonimizada, se llama «Cuenta eliminada» */
            deactivated: boolean;
            /** @description Solo si es profesional; null si dio de baja su cuenta */
            slug?: string | null;
            businessName?: string | null;
            /** @description Solo si es cliente (C-13) */
            neighborhoodName?: Record<string, never>;
            extraInfo?: string | null;
        };
        ConversationDto: {
            id: string;
            /** @enum {string} */
            myRole: "CUSTOMER" | "PROFESSIONAL";
            counterpart: components["schemas"]["CounterpartDto"];
            lastMessage: components["schemas"]["MessageDto"] | null;
            unread: number;
            /**
             * Format: date-time
             * @description Hasta dónde leyó el otro
             */
            counterpartReadAt: string | null;
            /** @description false si no se pueden mandar mensajes (profesional sin plan o cuenta dada de baja) */
            canWrite: boolean;
            /** Format: date-time */
            lastMessageAt: string | null;
        };
        AttachmentDto: {
            fileId: string;
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO";
            mimeType: string | null;
        };
        SendMessageDto: {
            body?: string;
            /** @description Archivos CHAT_ATTACHMENT propios y confirmados (hasta 5) */
            attachmentIds?: string[];
        };
        EditMessageDto: {
            body: string;
        };
        CreateRequestDto: {
            /** @description Usuarios de los profesionales (1 a 10) */
            professionalIds: string[];
            /**
             * Format: uuid
             * @description Oficio (los profesionales tienen que ofrecerlo)
             */
            professionId: string;
            description: string;
            /** @enum {string} */
            urgency: "CAN_WAIT" | "IMPATIENT" | "URGENT";
        };
        QuoteDto: {
            id: string;
            amount: string;
            currency: string;
            description: string | null;
            /** Format: date-time */
            proposedDate: string | null;
            /** @enum {string} */
            status: "SENT" | "SUPERSEDED" | "WITHDRAWN" | "ACCEPTED" | "REJECTED";
            /** Format: date-time */
            createdAt: string;
        };
        TargetDto: {
            id: string;
            requestId: string;
            professionalId: string;
            conversationId: string;
            /** @enum {string} */
            status: "PENDING" | "IN_DISCUSSION" | "QUOTED" | "SELECTED" | "NOT_SELECTED" | "DECLINED" | "CANCELLED";
            /** @description Presupuesto vigente */
            currentQuote: components["schemas"]["QuoteDto"] | null;
        };
        RequestDto: {
            id: string;
            customerId: string;
            professionId: string;
            description: string;
            /** @enum {string} */
            urgency: "CAN_WAIT" | "IMPATIENT" | "URGENT";
            /** @enum {string} */
            status: "OPEN" | "SELECTED" | "CANCELLED";
            /** @description El profesional solo ve el suyo */
            targets: components["schemas"]["TargetDto"][];
            contractId: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        ReasonDto: {
            reason?: string;
        };
        SendQuoteDto: {
            /** @description Importe en ARS */
            amount: number;
            description?: string;
            /** @description Fecha propuesta para el trabajo */
            proposedDate?: string;
        };
        SelectTargetDto: {
            /**
             * Format: uuid
             * @description Presupuesto vigente que acepta (opcional)
             */
            quoteId?: string;
        };
        ContractDto: {
            id: string;
            requestId: string;
            customerId: string;
            professionalId: string;
            conversationId: string;
            /** @enum {string} */
            status: "ACCEPTED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED_BY_CLIENT" | "CANCELLED_BY_PRO";
            acceptedQuote: components["schemas"]["QuoteDto"] | null;
            /** Format: date-time */
            scheduledAt: string | null;
            /** Format: date-time */
            startedAt: string | null;
            /** Format: date-time */
            completedAt: string | null;
            /** Format: date-time */
            cancelledAt: string | null;
            cancelReason: string | null;
            /** Format: date-time */
            createdAt: string;
            /** @description C-30: al empezar, sugerencia para el estado de atención (no se cambia solo) */
            suggestedAttentionStatus?: string;
        };
        ScheduleDto: {
            /** @description Fecha y hora acordadas */
            scheduledAt: string;
        };
        PlanOptionDto: {
            code: string;
            name: string;
            /** @example 15000.00 */
            price: string;
            currency: string;
            current: boolean;
            /** @description Si hoy se puede pagar este plan */
            available: boolean;
            /** @enum {string} */
            purpose?: "SUBSCRIPTION" | "UPGRADE_DIFFERENCE";
            /** @description Lo que se pagaría hoy (mes o diferencia) */
            amount?: string;
            /** @enum {string} */
            reason?: "RENEWAL_NOT_YET" | "UPGRADE_WINDOW_CLOSED" | "FREE_PLAN";
        };
        CheckoutDto: {
            /** @example MEDIUM */
            planCode: string;
        };
        CheckoutResponseDto: {
            /** Format: uuid */
            paymentId: string;
            /** @enum {string} */
            purpose: "SUBSCRIPTION" | "UPGRADE_DIFFERENCE";
            /** @example 15000.00 */
            amount: string;
            /** @example ARS */
            currency: string;
            /** @description Enlace al checkout de Mercado Pago */
            checkoutUrl: string;
        };
        PaymentItemDto: {
            /** Format: uuid */
            id: string;
            planCode: string;
            /** @enum {string} */
            purpose: "SUBSCRIPTION" | "UPGRADE_DIFFERENCE";
            amount: string;
            currency: string;
            /** @enum {string} */
            status: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
            applied: boolean;
            reverted: boolean;
            /** Format: date-time */
            grantedFrom: string | null;
            /** Format: date-time */
            grantedUntil: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        AdminPaymentItemDto: {
            /** Format: uuid */
            id: string;
            planCode: string;
            /** @enum {string} */
            purpose: "SUBSCRIPTION" | "UPGRADE_DIFFERENCE";
            amount: string;
            currency: string;
            /** @enum {string} */
            status: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
            applied: boolean;
            reverted: boolean;
            /** Format: date-time */
            grantedFrom: string | null;
            /** Format: date-time */
            grantedUntil: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: uuid */
            userId: string;
            providerPaymentId: string | null;
            /** @description Aprobado sin aplicar: no coincidió, ver auditoría */
            needsReview: boolean;
        };
        AdminPaymentListDto: {
            data: components["schemas"]["AdminPaymentItemDto"][];
            page: number;
            limit: number;
            total: number;
        };
        AdminChangePlanDto: {
            /** @example PREMIUM */
            planCode: string;
            reason: string;
        };
        CreateReviewDto: {
            /**
             * Format: uuid
             * @description Contratación terminada propia
             */
            contractId: string;
            rating: number;
            comment?: Record<string, never> | null;
        };
        ReviewAuthorDto: {
            /** @description Nombre e inicial del apellido, o "Usuario eliminado" */
            displayName: string;
        };
        ReviewReplyViewDto: {
            body: string;
            /** Format: date-time */
            repliedAt: string;
        };
        OwnReviewDto: {
            /** Format: uuid */
            id: string;
            rating: number;
            comment: string | null;
            author: components["schemas"]["ReviewAuthorDto"];
            reply: components["schemas"]["ReviewReplyViewDto"] | null;
            edited: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: uuid */
            contractId: string;
            /** Format: uuid */
            professionalId: string;
            /** @enum {string} */
            status: "VISIBLE" | "HIDDEN_BY_ADMIN";
            hiddenReason: string | null;
            /**
             * Format: date-time
             * @description Hasta cuándo se puede editar (30 días desde que terminó)
             */
            editableUntil: string;
        };
        UpdateReviewDto: {
            rating?: number;
            /** @description null lo borra */
            comment?: Record<string, never> | null;
        };
        ReviewReplyDto: {
            body: string;
        };
        PublicReviewDto: {
            /** Format: uuid */
            id: string;
            rating: number;
            comment: string | null;
            author: components["schemas"]["ReviewAuthorDto"];
            reply: components["schemas"]["ReviewReplyViewDto"] | null;
            edited: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        ReviewPageDto: {
            data: components["schemas"]["PublicReviewDto"][];
            /** @description Promedio de 1 a 5, un decimal */
            average: number | null;
            count: number;
            page: number;
            limit: number;
        };
        PlatformReviewDto: {
            /** Format: uuid */
            id: string;
            rating: number;
            comment: string | null;
            author: components["schemas"]["ReviewAuthorDto"];
            published: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        PlatformReviewPageDto: {
            data: components["schemas"]["PlatformReviewDto"][];
            page: number;
            limit: number;
            total: number;
        };
        PlatformReviewInputDto: {
            rating: number;
            comment?: Record<string, never> | null;
        };
        FavoriteDto: {
            /** Format: uuid */
            professionalId: string;
            /** @description false si hoy no aparece en el catálogo */
            listed: boolean;
            slug: string | null;
            firstName: string | null;
            lastName: string | null;
            businessName: string | null;
            avatarUrl: string | null;
            availabilityAlerts: boolean;
            /** @description Si su plan incluye los avisos de disponibilidad */
            alertsAvailable: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        SaveFavoriteDto: {
            /** @description Aviso cuando se pone "Disponible" (planes Medium y Premium) */
            availabilityAlerts?: boolean;
        };
        FavoriteAlertsDto: {
            availabilityAlerts: boolean;
        };
        ForumAuthorDto: {
            /** Format: uuid */
            userId: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL";
            /**
             * Format: date-time
             * @description Fecha de registro
             */
            memberSince: string;
        };
        NamedRefDto: {
            /** Format: uuid */
            id: string;
            name: string;
        };
        ForumMediaDto: {
            /** @enum {string} */
            kind: "IMAGE" | "VIDEO" | "DOCUMENT";
            url: string;
        };
        ForumPostDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            type: "QUESTION" | "PROFESSIONAL_WANTED";
            body: string;
            author: components["schemas"]["ForumAuthorDto"];
            professions: components["schemas"]["NamedRefDto"][];
            locality: components["schemas"]["NamedRefDto"] | null;
            neighborhood: components["schemas"]["NamedRefDto"] | null;
            budgetEstimate: string | null;
            deadline: string | null;
            resolved: boolean;
            media: components["schemas"]["ForumMediaDto"][];
            likeCount: number;
            replyCount: number;
            edited: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        ForumPageDto: {
            data: components["schemas"]["ForumPostDto"][];
            page: number;
            limit: number;
            total: number;
        };
        ForumReplyDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            parentReplyId: string | null;
            author: components["schemas"]["ForumAuthorDto"] | null;
            /** @description Vacío si se borró o la ocultó el admin */
            body: string;
            proposedPrice: string | null;
            /** @description Borrada o oculta: queda el lugar para las respuestas a ella */
            removed: boolean;
            likeCount: number;
            edited: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        ForumPostDetailDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            type: "QUESTION" | "PROFESSIONAL_WANTED";
            body: string;
            author: components["schemas"]["ForumAuthorDto"];
            professions: components["schemas"]["NamedRefDto"][];
            locality: components["schemas"]["NamedRefDto"] | null;
            neighborhood: components["schemas"]["NamedRefDto"] | null;
            budgetEstimate: string | null;
            deadline: string | null;
            resolved: boolean;
            media: components["schemas"]["ForumMediaDto"][];
            likeCount: number;
            replyCount: number;
            edited: boolean;
            /** Format: date-time */
            createdAt: string;
            /** @description En orden; se anidan con parentReplyId */
            replies: components["schemas"]["ForumReplyDto"][];
        };
        ForumLikesDto: {
            post: boolean;
            replyIds: string[];
        };
        CreateForumPostDto: {
            /** @enum {string} */
            type: "QUESTION" | "PROFESSIONAL_WANTED";
            body: string;
            professionIds?: string[];
            /** Format: uuid */
            localityId?: string;
            /**
             * Format: uuid
             * @description Barrio aprobado de esa localidad
             */
            neighborhoodId?: string;
            /** @description Presupuesto estimado en ARS */
            budgetEstimate?: number;
            /** @example 2026-12-01 */
            deadline?: string;
            /** @description Archivos FORUM_MEDIA propios, confirmados */
            mediaFileIds?: string[];
        };
        UpdateForumPostDto: {
            body?: string;
            professionIds?: string[];
            /** Format: uuid */
            localityId?: Record<string, never> | null;
            /** Format: uuid */
            neighborhoodId?: Record<string, never> | null;
            budgetEstimate?: Record<string, never> | null;
            deadline?: Record<string, never> | null;
        };
        CreateForumReplyDto: {
            body: string;
            /**
             * Format: uuid
             * @description Respuesta a la que contesta
             */
            parentReplyId?: string;
            /** @description Solo profesionales, en "Solicito profesional" */
            proposedPrice?: number;
        };
        UpdateForumReplyDto: {
            body?: string;
            proposedPrice?: Record<string, never> | null;
        };
        CustomerCardDto: {
            /** Format: uuid */
            userId: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            /**
             * Format: date-time
             * @description Fecha de registro
             */
            memberSince: string;
            /** @description Publicaciones visibles en el foro */
            postCount: number;
            /** @description "Solicito profesional" sin resolver */
            openRequestCount: number;
            /**
             * Format: date-time
             * @description Su publicación más reciente
             */
            lastPostAt: string | null;
            /** @description Oficios de sus publicaciones */
            professions: components["schemas"]["NamedRefDto"][];
            /** @description Localidades de sus publicaciones */
            localities: components["schemas"]["NamedRefDto"][];
        };
        CustomerDirectoryPageDto: {
            data: components["schemas"]["CustomerCardDto"][];
            page: number;
            limit: number;
            total: number;
        };
        CreateReportDto: {
            /** @enum {string} */
            targetType: "PROFILE" | "MESSAGE" | "FORUM_POST" | "FORUM_REPLY" | "REVIEW";
            /**
             * Format: uuid
             * @description En PROFILE, el id del usuario
             */
            targetId: string;
            /** @enum {string} */
            reason: "DISCRIMINATION" | "DISRESPECT" | "HARASSMENT" | "NO_SHOW" | "NOT_AS_AGREED" | "FRAUD" | "THREATS" | "OFFENSIVE_CONTENT" | "SPAM" | "OTHER";
            description: string;
            /** @description Archivos EVIDENCE propios, confirmados */
            evidenceFileIds?: string[];
        };
        MyReportDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            targetType: "PROFILE" | "MESSAGE" | "FORUM_POST" | "FORUM_REPLY" | "REVIEW";
            /** Format: uuid */
            targetId: string;
            /** @enum {string} */
            reason: "DISCRIMINATION" | "DISRESPECT" | "HARASSMENT" | "NO_SHOW" | "NOT_AS_AGREED" | "FRAUD" | "THREATS" | "OFFENSIVE_CONTENT" | "SPAM" | "OTHER";
            /** @enum {string} */
            status: "SUBMITTED" | "UNDER_REVIEW" | "VALID" | "REJECTED";
            /** Format: date-time */
            createdAt: string;
        };
        SanctionDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            type: "WARNING" | "SUSPENSION" | "BAN" | "PROFILE_HIDDEN";
            reason: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string | null;
            active: boolean;
            /** Format: date-time */
            liftedAt: string | null;
        };
        StrikeDto: {
            /** Format: uuid */
            id: string;
            weight: number;
            reason: string;
            voided: boolean;
            voidReason: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        AppealDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            strikeId: string | null;
            /** Format: uuid */
            sanctionId: string | null;
            body: string;
            /** @enum {string} */
            status: "OPEN" | "ACCEPTED" | "REJECTED";
            decisionNote: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        MyModerationDto: {
            sanctions: components["schemas"]["SanctionDto"][];
            strikes: components["schemas"]["StrikeDto"][];
            appeals: components["schemas"]["AppealDto"][];
        };
        CreateAppealDto: {
            /**
             * Format: uuid
             * @description Uno de los dos
             */
            strikeId?: string;
            /** Format: uuid */
            sanctionId?: string;
            body: string;
        };
        UserRefDto: {
            /** Format: uuid */
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            status: string;
        };
        AdminReportDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            targetType: "PROFILE" | "MESSAGE" | "FORUM_POST" | "FORUM_REPLY" | "REVIEW";
            /** Format: uuid */
            targetId: string;
            /** @enum {string} */
            reason: "DISCRIMINATION" | "DISRESPECT" | "HARASSMENT" | "NO_SHOW" | "NOT_AS_AGREED" | "FRAUD" | "THREATS" | "OFFENSIVE_CONTENT" | "SPAM" | "OTHER";
            /** @enum {string} */
            status: "SUBMITTED" | "UNDER_REVIEW" | "VALID" | "REJECTED";
            /** Format: date-time */
            createdAt: string;
            description: string;
            reporter: components["schemas"]["UserRefDto"];
            reportedUser: components["schemas"]["UserRefDto"];
            /** @description Ver con GET /evidence/:fileId */
            evidenceFileIds: string[];
            /** @description El contenido reportado como estaba (texto, estado) */
            target: Record<string, never> | null;
            /** Format: date-time */
            resolvedAt: string | null;
            resolutionNote: string | null;
        };
        AdminReportListDto: {
            data: components["schemas"]["AdminReportDto"][];
            page: number;
            limit: number;
            total: number;
        };
        ResolveReportDto: {
            /** @description true = válido; false = rechazado (sin consecuencias) */
            valid: boolean;
            note: string;
        };
        ConversationMessageDto: {
            /** Format: uuid */
            id: string;
            senderType: string;
            senderId: string | null;
            body: string;
            /** @description Versión original (ADR 0024) */
            originalBody: string | null;
            edited: boolean;
            deleted: boolean;
            reported: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        ReportConversationDto: {
            /** Format: uuid */
            conversationId: string;
            messages: components["schemas"]["ConversationMessageDto"][];
        };
        AddStrikeDto: {
            /** @description Peso según la gravedad */
            weight: number;
            reason: string;
            /** Format: uuid */
            reportId?: string;
        };
        ApplySanctionDto: {
            /** @enum {string} */
            type: "WARNING" | "SUSPENSION" | "BAN" | "PROFILE_HIDDEN";
            /** @description El usuario lo ve */
            reason: string;
            /** @description Solo suspensión y perfil oculto: se levanta sola */
            endsAt?: string;
            /** Format: uuid */
            reportId?: string;
        };
        DecideAppealDto: {
            /** @enum {string} */
            decision: "ACCEPTED" | "REJECTED";
            note: string;
        };
        ContactDto: {
            name: string;
            email: string;
            /** @enum {string} */
            category: "SUGGESTION" | "BUG" | "INCIDENT" | "COMPLAINT" | "OTHER";
            body: string;
            /** @description Turnstile: obligatorio cuando el CAPTCHA está activado */
            captchaToken?: string;
        };
        CreateTicketDto: {
            /** @enum {string} */
            category: "SUGGESTION" | "BUG" | "INCIDENT" | "COMPLAINT" | "OTHER";
            body: string;
            /**
             * Format: uuid
             * @description Una foto (archivo EVIDENCE propio)
             */
            fileId?: string;
        };
        TicketMessageDto: {
            /** Format: uuid */
            id: string;
            fromStaff: boolean;
            body: string;
            /** @description Ver con GET /evidence/:fileId */
            fileId: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        TicketDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            category: "SUGGESTION" | "BUG" | "INCIDENT" | "COMPLAINT" | "OTHER";
            /** @enum {string} */
            status: "OPEN" | "ANSWERED" | "CLOSED";
            messages: components["schemas"]["TicketMessageDto"][];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        TicketMessageInputDto: {
            body: string;
            /** Format: uuid */
            fileId?: string;
        };
        AnnouncementDto: {
            /** Format: uuid */
            id: string;
            title: string;
            body: string;
            /** Format: date-time */
            publishedAt: string | null;
        };
        AdminTicketDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            category: "SUGGESTION" | "BUG" | "INCIDENT" | "COMPLAINT" | "OTHER";
            /** @enum {string} */
            status: "OPEN" | "ANSWERED" | "CLOSED";
            messages: components["schemas"]["TicketMessageDto"][];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            /** Format: uuid */
            userId: string | null;
            /** @description Email de la cuenta o del formulario público */
            email: string;
            name: string | null;
        };
        AdminTicketReplyDto: {
            body: string;
        };
        AnnouncementSegmentDto: {
            roles?: ("CUSTOMER" | "PROFESSIONAL")[];
            /** @description Profesionales que ofrecen alguno */
            professionIds?: string[];
            /** @description Profesionales con alguno de esos planes vigente */
            planCodes?: string[];
        };
        AdminAnnouncementDto: {
            /** Format: uuid */
            id: string;
            title: string;
            body: string;
            /** Format: date-time */
            publishedAt: string | null;
            segment: components["schemas"]["AnnouncementSegmentDto"];
            /** @description A cuántas personas les llegó */
            recipients: number;
        };
        CreateAnnouncementDto: {
            title: string;
            body: string;
            /** @description Vacío = todos */
            segment?: components["schemas"]["AnnouncementSegmentDto"];
        };
        AdminMessageDto: {
            title: string;
            body: string;
        };
        DashboardDto: {
            /** @description Clientes y profesionales */
            usersByRole: Record<string, never>;
            usersByStatus: Record<string, never>;
            /** @description Última suscripción de cada profesional */
            subscriptionsByStatus: Record<string, never>;
            /** @description Con prueba o plan vigente */
            professionalsByPlan: Record<string, never>;
            newUsersLast7Days: number;
            newForumPostsLast7Days: number;
            newReportsLast7Days: number;
            openReports: number;
            openAppeals: number;
            openSupportTickets: number;
            pendingVerifications: number;
            sanctionedUsers: number;
            /** @description Pagos aprobados sin aplicar (ADR 0026) */
            paymentsToReview: number;
        };
        AdminProfessionalSummaryDto: {
            slug: string;
            businessName: string | null;
            /** @description true si cualquiera la ve en el catálogo */
            published: boolean;
            /** @description Oficios activos (el principal primero) */
            professions: string[];
            /** @description Plan vigente (en prueba es el de la prueba); null sin prueba ni plan vigente */
            planCode: string | null;
            /** @description TRIAL o ACTIVE; null si no tiene vigente */
            subscriptionStatus: string | null;
        };
        AdminUserItemDto: {
            /** Format: uuid */
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            phone: string | null;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            /** @enum {string} */
            status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
            verificationStatus: string;
            /** @description Tiene Google vinculado */
            google: boolean;
            /** @description Tiene contraseña (si no, solo entra con Google) */
            hasPassword: boolean;
            /** Format: date-time */
            emailVerifiedAt: string | null;
            /** Format: date-time */
            lastLoginAt: string | null;
            /** @description Localidad (y barrio) del perfil */
            location: string | null;
            professional: components["schemas"]["AdminProfessionalSummaryDto"] | null;
            /** @description Sanciones vigentes */
            activeSanctions: number;
            /** @description Suma del peso de los strikes no anulados */
            activeStrikeWeight: number;
            reportsAgainst: number;
            /** @description Reportes en contra sin resolver */
            openReportsAgainst: number;
            /** Format: date-time */
            createdAt: string;
        };
        AdminUserListDto: {
            data: components["schemas"]["AdminUserItemDto"][];
            page: number;
            limit: number;
            total: number;
        };
        AdminSubscriptionSummaryDto: {
            status: string;
            planCode: string | null;
            /** Format: date-time */
            trialEndsAt: string | null;
            /** Format: date-time */
            currentPeriodEnd: string | null;
        };
        AdminPaymentSummaryDto: {
            /** Format: uuid */
            id: string;
            planCode: string;
            purpose: string;
            amount: string;
            status: string;
            applied: boolean;
            reverted: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        AdminUserDetailDto: {
            /** Format: uuid */
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            avatarUrl: string | null;
            /** @description Foto nueva esperando revisión */
            pendingAvatarUrl: string | null;
            /** @description Tiene Google vinculado */
            google: boolean;
            hasPassword: boolean;
            /** Format: date-time */
            emailVerifiedAt: string | null;
            /** Format: date-time */
            lastLoginAt: string | null;
            location: string | null;
            professional: components["schemas"]["AdminProfessionalSummaryDto"] | null;
            /** @description Profesionales: lo que le falta a su página para ser pública (vacío = publicada) */
            publicationMissing: ("ACCOUNT_NOT_ACTIVE" | "ACCOUNT_RESTRICTED" | "IDENTITY_NOT_VERIFIED" | "NO_AVATAR" | "NO_BIO" | "NO_PROFESSION" | "NO_SERVICE_AREA" | "NO_LIVE_PLAN" | "PROFILE_DEACTIVATED" | "PROFILE_HIDDEN")[] | null;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            /** @enum {string} */
            status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
            statusReason: string | null;
            verificationStatus: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string | null;
            /** Format: date-time */
            deletionScheduledFor: string | null;
            subscription: components["schemas"]["AdminSubscriptionSummaryDto"] | null;
            sanctions: components["schemas"]["SanctionDto"][];
            strikes: components["schemas"]["StrikeDto"][];
            /** @description Suma del peso de los strikes no anulados */
            activeStrikeWeight: number;
            reportsAgainst: number;
            validReportsAgainst: number;
            reportsMade: number;
            payments: components["schemas"]["AdminPaymentSummaryDto"][];
        };
        RevenuePersonDto: {
            /** Format: uuid */
            id: string;
            /** @description "Usuario eliminado" si la cuenta se anonimizó */
            name: string;
            email: string | null;
            /** @enum {string} */
            role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
            deleted: boolean;
            /** @description Donde trabaja (profesional) o vive (cliente), hoy */
            localities: string[];
        };
        RevenuePaymentItemDto: {
            /** Format: uuid */
            id: string;
            /**
             * Format: date-time
             * @description Aprobación; si nunca se aprobó, creación
             */
            date: string;
            user: components["schemas"]["RevenuePersonDto"];
            planCode: string;
            planName: string;
            /** @description Si el pago cambió el plan */
            previousPlanCode: string | null;
            /**
             * @description Null: sin aplicar
             * @enum {string|null}
             */
            kind: "NEW" | "RENEWAL" | "REACTIVATION" | "UPGRADE" | null;
            /** @enum {string} */
            status: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
            /** @example 15000.00 */
            amount: string;
            /** @example ARS */
            currency: string;
            /** Format: date-time */
            moneyReturnedAt: string | null;
        };
        RevenuePaymentListDto: {
            data: components["schemas"]["RevenuePaymentItemDto"][];
            page: number;
            limit: number;
            total: number;
        };
        RevenueRegistrationItemDto: {
            user: components["schemas"]["RevenuePersonDto"];
            /** Format: date-time */
            registeredAt: string;
            /** @description Plan de la última suscripción */
            currentPlanCode: string | null;
            /** @description Tiene algún cobro que no se devolvió. Null: cliente que nunca pagó */
            hasPaid: boolean | null;
        };
        RevenueRegistrationListDto: {
            data: components["schemas"]["RevenueRegistrationItemDto"][];
            page: number;
            limit: number;
            total: number;
        };
        RevenuePlanAmountsDto: {
            /**
             * @description Cobrado (por fecha de aprobación)
             * @example 45000.00
             */
            gross: string;
            /**
             * @description Reembolsos (por fecha de devolución)
             * @example 0.00
             */
            refunds: string;
            /** @example 0.00 */
            chargebacks: string;
            /** @example 45000.00 */
            net: string;
            /** @description Cantidad de cobros */
            payments: number;
            /** @description Cantidad de reembolsos y contracargos */
            returns: number;
            planCode: string;
        };
        RevenueBucketDto: {
            /**
             * @description Cobrado (por fecha de aprobación)
             * @example 45000.00
             */
            gross: string;
            /**
             * @description Reembolsos (por fecha de devolución)
             * @example 0.00
             */
            refunds: string;
            /** @example 0.00 */
            chargebacks: string;
            /** @example 45000.00 */
            net: string;
            /** @description Cantidad de cobros */
            payments: number;
            /** @description Cantidad de reembolsos y contracargos */
            returns: number;
            byPlan: components["schemas"]["RevenuePlanAmountsDto"][];
            /**
             * @description Comienzo del período
             * @example 2026-11-01
             */
            start: string;
        };
        RevenueTotalsDto: {
            /**
             * @description Cobrado (por fecha de aprobación)
             * @example 45000.00
             */
            gross: string;
            /**
             * @description Reembolsos (por fecha de devolución)
             * @example 0.00
             */
            refunds: string;
            /** @example 0.00 */
            chargebacks: string;
            /** @example 45000.00 */
            net: string;
            /** @description Cantidad de cobros */
            payments: number;
            /** @description Cantidad de reembolsos y contracargos */
            returns: number;
            byPlan: components["schemas"]["RevenuePlanAmountsDto"][];
        };
        RevenuePreviousDto: {
            /**
             * @description Cobrado (por fecha de aprobación)
             * @example 45000.00
             */
            gross: string;
            /**
             * @description Reembolsos (por fecha de devolución)
             * @example 0.00
             */
            refunds: string;
            /** @example 0.00 */
            chargebacks: string;
            /** @example 45000.00 */
            net: string;
            /** @description Cantidad de cobros */
            payments: number;
            /** @description Cantidad de reembolsos y contracargos */
            returns: number;
            byPlan: components["schemas"]["RevenuePlanAmountsDto"][];
            from: string;
            to: string;
        };
        RevenueChangeDto: {
            /**
             * @description Neto actual menos el anterior
             * @example 5000.00
             */
            net: string;
            /** @description Null si el anterior fue 0 */
            netPercent: number | null;
        };
        RevenueSummaryDto: {
            from: string;
            to: string;
            /** @enum {string} */
            groupBy: "day" | "week" | "month" | "year";
            /** @example ARS */
            currency: string;
            buckets: components["schemas"]["RevenueBucketDto"][];
            total: components["schemas"]["RevenueTotalsDto"];
            previous: components["schemas"]["RevenuePreviousDto"];
            change: components["schemas"]["RevenueChangeDto"];
            /** @description Con filtro de localidad, un profesional que trabaja en varias suma en cada una */
            localityMayOverlap: boolean;
        };
        RevenueExportDto: {
            /**
             * @description Desde (incluido), hora de Córdoba
             * @example 2026-11-01
             */
            from?: string;
            /**
             * @description Hasta (incluido), hora de Córdoba
             * @example 2026-11-30
             */
            to?: string;
            /** Format: uuid */
            planId?: string;
            /**
             * Format: uuid
             * @description Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí
             */
            localityId?: string;
            /** @enum {string} */
            report: "PAYMENTS" | "REGISTRATIONS" | "SUMMARY";
            /** @enum {string} */
            status?: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
            /** @enum {string} */
            kind?: "NEW" | "RENEWAL" | "REACTIVATION" | "UPGRADE";
            /** @enum {string} */
            role?: "CUSTOMER" | "PROFESSIONAL";
            hasPaid?: boolean;
            /**
             * @default month
             * @enum {string}
             */
            groupBy: "day" | "week" | "month" | "year";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    NotificationsController_pushKey_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PushKeyDto"];
                };
            };
        };
    };
    NotificationsController_subscribe_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushSubscribeDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_unsubscribe_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushUnsubscribeDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_preferences_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreferenceDto"][];
                };
            };
        };
    };
    NotificationsController_updatePreferences_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePreferencesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreferenceDto"][];
                };
            };
        };
    };
    NotificationsController_list_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_unread_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_read_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_readAll_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_register_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDto"];
                };
            };
        };
    };
    AuthController_login_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_verifyMfa_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaVerifyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CsrfTokenDto"];
                };
            };
        };
    };
    AuthController_logout_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logoutAll_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeDto"];
                };
            };
        };
    };
    AuthController_csrfToken_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionCsrfDto"];
                };
            };
        };
    };
    AuthController_listSessions_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionSummaryDto"][];
                };
            };
        };
    };
    AuthController_closeSession_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_closeByLink_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionClosedDto"];
                };
            };
        };
    };
    AuthController_verifyEmail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_resendEmail_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_forgotPassword_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_resetPassword_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_changePassword_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_setPassword_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetPasswordDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminAuthController_passwordReset_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDto"];
                };
            };
        };
    };
    GoogleAuthController_start_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirección a Google */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GoogleAuthController_callback_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirección al frontend */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GoogleAuthController_pending_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GooglePendingDto"];
                };
            };
        };
    };
    GoogleAuthController_link_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleLinkPasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
        };
    };
    GoogleAuthController_unlink_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GoogleAuthController_linkByEmail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GoogleAuthController_confirm_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleLinkConfirmDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
        };
    };
    GoogleAuthController_register_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleRegisterDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
        };
    };
    LocationsController_provinces_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LocationsController_localities_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LocationsController_neighborhoodsSearch_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminNeighborhoodsController_list_v1: {
        parameters: {
            query?: {
                status?: "PENDING" | "APPROVED" | "MERGED";
                localityId?: string;
                search?: string;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminNeighborhoodListDto"];
                };
            };
        };
    };
    AdminNeighborhoodsController_approve_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ModerationReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminNeighborhoodDto"];
                };
            };
        };
    };
    AdminNeighborhoodsController_rename_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RenameNeighborhoodDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminNeighborhoodDto"];
                };
            };
        };
    };
    AdminNeighborhoodsController_merge_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MergeNeighborhoodDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminNeighborhoodDto"];
                };
            };
        };
    };
    ProfessionalsController_me_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_update_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfessionalProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_setTheme_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileThemeDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_setAttention_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttentionStatusDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_replaceProfessions_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceProfessionsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_replaceServiceAreas_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceServiceAreasDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_addMedia_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddMediaDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaItemDto"];
                };
            };
        };
    };
    ProfessionalsController_reorderMedia_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderMediaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_chooseVisibleMedia_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VisibleMediaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_chooseVisibleProfessions_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VisibleProfessionsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_removeMedia_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProfessionalsController_addCertification_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddCertificationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CertificationItemDto"];
                };
            };
        };
    };
    ProfessionalsController_removeCertification_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProfessionalsController_replaceSocialLinks_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceSocialLinksDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_replaceAvailability_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceAvailabilityDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_addException_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddAvailabilityExceptionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    ProfessionalsController_removeException_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminProfessionalContentController_profile_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    AdminProfessionalContentController_updateProfile_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminUpdateProfessionalProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMeDto"];
                };
            };
        };
    };
    AdminProfessionalContentController_hideMedia_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminProfessionalContentController_restoreMedia_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminProfessionalContentController_hideCertification_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminProfessionalContentController_restoreCertification_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionSummaryDto"];
                };
            };
        };
    };
    UploadsController_create_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateUploadDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateUploadResponseDto"];
                };
            };
        };
    };
    UploadsController_complete_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileResponseDto"];
                };
            };
        };
    };
    LocalFilesController_content_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UploadsController_uploadContent_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_live_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    HealthController_ready_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description La base de datos no está disponible. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProfessionsController_list_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_personal_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PersonalDataDto"];
                };
            };
        };
    };
    UsersController_deleteMe_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteOwnAccountDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updatePersonal_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePersonalDataDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PersonalDataDto"];
                };
            };
        };
    };
    UsersController_setAvatar_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetAvatarDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvatarResponseDto"];
                };
            };
        };
    };
    AdminPanelController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminUserDetailDto"];
                };
            };
        };
    };
    AdminUsersController_delete_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountActionDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminUsersController_updateData_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminUpdatePersonalDataDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PersonalDataDto"];
                };
            };
        };
    };
    AdminUsersController_suspend_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SuspendAccountDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountSummaryDto"];
                };
            };
        };
    };
    AdminUsersController_ban_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BanAccountDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountSummaryDto"];
                };
            };
        };
    };
    AdminUsersController_restore_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountActionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountSummaryDto"];
                };
            };
        };
    };
    AdminUsersController_changeRole_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountSummaryDto"];
                };
            };
        };
    };
    AdminUsersController_revokeSessions_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountActionDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CustomersController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerProfileDto"];
                };
            };
        };
    };
    CustomersController_update_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCustomerProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerProfileDto"];
                };
            };
        };
    };
    IdentityVerificationController_start_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StartVerificationResponseDto"];
                };
            };
        };
    };
    IdentityVerificationController_getMine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VerificationResponseDto"];
                };
            };
        };
    };
    AdminIdentityVerificationController_list_v1: {
        parameters: {
            query?: {
                status?: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminVerificationListDto"];
                };
            };
        };
    };
    AdminIdentityVerificationController_decide_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminDecisionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminVerificationResponseDto"];
                };
            };
        };
    };
    CatalogController_search_v1: {
        parameters: {
            query?: {
                professionId?: string;
                localityId?: string;
                /** @description Barrio aprobado. Incluye a quienes cubren toda la localidad. */
                neighborhoodId?: string;
                /** @description Solo los disponibles en este momento ("Disponible ya") */
                availableNow?: boolean;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogPageDto"];
                };
            };
        };
    };
    CatalogController_profile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicProfileDto"];
                };
            };
        };
    };
    OwnPublicPageController_get_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnPublicPageDto"];
                };
            };
        };
    };
    MetricsController_mine_v1: {
        parameters: {
            query?: {
                /** @description Desde (incluido). Defecto: día 1 del mes */
                from?: string;
                /** @description Hasta (incluido). Defecto: hoy */
                to?: string;
                groupBy?: "day" | "week" | "month";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMetricsDto"];
                };
            };
        };
    };
    AdminMetricsController_forUser_v1: {
        parameters: {
            query?: {
                /** @description Desde (incluido). Defecto: día 1 del mes */
                from?: string;
                /** @description Hasta (incluido). Defecto: hoy */
                to?: string;
                groupBy?: "day" | "week" | "month";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalMetricsDto"];
                };
            };
        };
    };
    ChatController_list_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationDto"][];
                };
            };
        };
    };
    ChatController_open_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OpenConversationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationDto"];
                };
            };
        };
    };
    ChatController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationDto"];
                };
            };
        };
    };
    ChatController_messages_v1: {
        parameters: {
            query?: {
                /** @description Mensajes anteriores a esta fecha (paginación hacia atrás) */
                before?: string;
                limit?: components["schemas"]["Object"];
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDto"][];
                };
            };
        };
    };
    ChatController_send_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendMessageDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDto"];
                };
            };
        };
    };
    ChatController_read_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChatController_remove_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChatController_edit_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EditMessageDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageDto"];
                };
            };
        };
    };
    ChatController_attachment_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestsController_mine_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"][];
                };
            };
        };
    };
    RequestsController_create_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_received_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"][];
                };
            };
        };
    };
    RequestsController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_cancel_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_decline_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                targetId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_quote_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                targetId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendQuoteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_withdraw_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                quoteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestDto"];
                };
            };
        };
    };
    RequestsController_select_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                targetId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SelectTargetDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    ContractsController_list_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"][];
                };
            };
        };
    };
    ContractsController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    ContractsController_schedule_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    ContractsController_start_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    ContractsController_complete_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    ContractsController_cancel_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContractDto"];
                };
            };
        };
    };
    PaymentsController_plans_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlanOptionDto"][];
                };
            };
        };
    };
    PaymentsController_checkout_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutResponseDto"];
                };
            };
        };
    };
    PaymentsController_mine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentItemDto"][];
                };
            };
        };
    };
    AdminPaymentsController_list_v1: {
        parameters: {
            query?: {
                userId?: string;
                status?: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminPaymentListDto"];
                };
            };
        };
    };
    AdminPaymentsController_changePlan_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminChangePlanDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReviewsController_create_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"];
                };
            };
        };
    };
    ReviewsController_mine_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"][];
                };
            };
        };
    };
    ReviewsController_received_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"][];
                };
            };
        };
    };
    ReviewsController_remove_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReviewsController_update_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReviewDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"];
                };
            };
        };
    };
    ReviewsController_reply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewReplyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"];
                };
            };
        };
    };
    ReviewsController_removeReply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnReviewDto"];
                };
            };
        };
    };
    PublicReviewsController_list_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewPageDto"];
                };
            };
        };
    };
    PlatformReviewsController_published_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformReviewPageDto"];
                };
            };
        };
    };
    PlatformReviewsController_mine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformReviewDto"];
                };
            };
        };
    };
    PlatformReviewsController_upsert_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlatformReviewInputDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformReviewDto"];
                };
            };
        };
    };
    PlatformReviewsController_remove_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminReviewsController_hide_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminReviewsController_restore_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminReviewsController_platformReviews_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                published?: boolean;
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformReviewPageDto"];
                };
            };
        };
    };
    AdminReviewsController_publish_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminReviewsController_unpublish_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FavoritesController_list_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteDto"][];
                };
            };
        };
    };
    FavoritesController_save_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                professionalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveFavoriteDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FavoritesController_remove_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                professionalId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FavoritesController_setAlerts_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                professionalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FavoriteAlertsDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_list_v1: {
        parameters: {
            query?: {
                type?: "QUESTION" | "PROFESSIONAL_WANTED";
                professionId?: string;
                localityId?: string;
                resolved?: boolean;
                /** @description Solo las de esta persona (la ficha de un cliente en "Clientes") */
                authorId?: string;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumPageDto"];
                };
            };
        };
    };
    ForumController_create_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateForumPostDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumPostDetailDto"];
                };
            };
        };
    };
    ForumController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumPostDetailDto"];
                };
            };
        };
    };
    ForumController_remove_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_update_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateForumPostDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumPostDetailDto"];
                };
            };
        };
    };
    ForumController_myLikes_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumLikesDto"];
                };
            };
        };
    };
    ForumController_resolve_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumPostDetailDto"];
                };
            };
        };
    };
    ForumController_reply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateForumReplyDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumReplyDto"];
                };
            };
        };
    };
    ForumController_removeReply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_updateReply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateForumReplyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForumReplyDto"];
                };
            };
        };
    };
    ForumController_likePost_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_unlikePost_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_likeReply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ForumController_unlikeReply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminForumController_hidePost_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminForumController_restorePost_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminForumController_hideReply_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminForumController_restoreReply_v1: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HideContentDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CustomersController_list_v1: {
        parameters: {
            query?: {
                /** @description Nombre o apellido */
                q?: string;
                /** @description Publicó algo con ese oficio */
                professionId?: string;
                /** @description Publicó algo en esa localidad */
                localityId?: string;
                /** @description Solo con "Solicito profesional" sin resolver */
                withOpenRequests?: boolean;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerDirectoryPageDto"];
                };
            };
        };
    };
    CustomersController_card_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerCardDto"];
                };
            };
        };
    };
    ReportsController_create_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReportDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyReportDto"];
                };
            };
        };
    };
    ReportsController_mine_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyReportDto"][];
                };
            };
        };
    };
    MyModerationController_me_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyModerationDto"];
                };
            };
        };
    };
    MyModerationController_appeal_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAppealDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppealDto"];
                };
            };
        };
    };
    EvidenceController_content_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminModerationController_list_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                status?: "SUBMITTED" | "UNDER_REVIEW" | "VALID" | "REJECTED";
                targetType?: "PROFILE" | "MESSAGE" | "FORUM_POST" | "FORUM_REPLY" | "REVIEW";
                reportedUserId?: string;
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReportListDto"];
                };
            };
        };
    };
    AdminModerationController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReportDto"];
                };
            };
        };
    };
    AdminModerationController_review_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReportDto"];
                };
            };
        };
    };
    AdminModerationController_resolve_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveReportDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReportDto"];
                };
            };
        };
    };
    AdminModerationController_conversation_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportConversationDto"];
                };
            };
        };
    };
    AdminModerationController_addStrike_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddStrikeDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StrikeDto"];
                };
            };
        };
    };
    AdminModerationController_voidStrike_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ModerationReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StrikeDto"];
                };
            };
        };
    };
    AdminModerationController_sanction_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplySanctionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SanctionDto"];
                };
            };
        };
    };
    AdminModerationController_lift_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ModerationReasonDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SanctionDto"];
                };
            };
        };
    };
    AdminModerationController_appeals_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                status?: "OPEN" | "ACCEPTED" | "REJECTED";
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminModerationController_decide_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DecideAppealDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppealDto"];
                };
            };
        };
    };
    SupportController_contact_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SupportController_list_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketDto"][];
                };
            };
        };
    };
    SupportController_create_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTicketDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketDto"];
                };
            };
        };
    };
    SupportController_get_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketDto"];
                };
            };
        };
    };
    SupportController_reply_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TicketMessageInputDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketDto"];
                };
            };
        };
    };
    AnnouncementsController_get_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementDto"];
                };
            };
        };
    };
    AdminSupportController_tickets_v1: {
        parameters: {
            query?: {
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                status?: "OPEN" | "ANSWERED" | "CLOSED";
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminSupportController_ticket_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminTicketDto"];
                };
            };
        };
    };
    AdminSupportController_replyTicket_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminTicketReplyDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminTicketDto"];
                };
            };
        };
    };
    AdminSupportController_close_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminTicketDto"];
                };
            };
        };
    };
    AdminSupportController_announcementsList_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminAnnouncementDto"][];
                };
            };
        };
    };
    AdminSupportController_publish_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAnnouncementDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminAnnouncementDto"];
                };
            };
        };
    };
    AdminSupportController_message_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminMessageDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminPanelController_dashboard_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DashboardDto"];
                };
            };
        };
    };
    AdminPanelController_search_v1: {
        parameters: {
            query?: {
                /** @description Nombre, apellido o email */
                q?: string;
                role?: "CUSTOMER" | "PROFESSIONAL";
                status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED";
                /** @description Verificación de identidad */
                verification?: "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";
                /** @description Recién agregados: hoy, últimos 7 o 30 días */
                joined?: "today" | "7d" | "30d";
                /** @description Moderación, separadas por coma (tienen que cumplirse todas): sanción vigente, strikes sin anular, algún reporte en contra, reportes sin resolver */
                flags?: ("sanctioned" | "strikes" | "reported" | "open_reports")[];
                /** @description Profesionales: en prueba, con un plan pago vigente o sin ninguno (NONE) */
                plan?: "TRIAL" | "BASIC" | "MEDIUM" | "PREMIUM" | "NONE";
                /** @description Profesionales: página pública o no */
                pageState?: "published" | "unpublished";
                /** @description Cómo ingresa: con Google o solo con contraseña */
                login?: "google" | "password";
                /** @description Por defecto, los más nuevos primero */
                sort?: "recent" | "oldest" | "name" | "last_login";
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminUserListDto"];
                };
            };
        };
    };
    RevenueController_payments_v1: {
        parameters: {
            query?: {
                /** @description Desde (incluido), hora de Córdoba */
                from?: string;
                /** @description Hasta (incluido), hora de Córdoba */
                to?: string;
                planId?: string;
                /** @description Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí */
                localityId?: string;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                /** @description Sin estado: aprobados, reembolsados y contracargos (los que movieron plata) */
                status?: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
                kind?: "NEW" | "RENEWAL" | "REACTIVATION" | "UPGRADE";
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevenuePaymentListDto"];
                };
            };
        };
    };
    RevenueController_registrations_v1: {
        parameters: {
            query?: {
                /** @description Desde (incluido), hora de Córdoba */
                from?: string;
                /** @description Hasta (incluido), hora de Córdoba */
                to?: string;
                planId?: string;
                /** @description Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí */
                localityId?: string;
                page?: components["schemas"]["Object"];
                limit?: components["schemas"]["Object"];
                role?: "CUSTOMER" | "PROFESSIONAL";
                /** @description Tiene algún cobro que no se devolvió */
                hasPaid?: boolean;
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevenueRegistrationListDto"];
                };
            };
        };
    };
    RevenueController_summary_v1: {
        parameters: {
            query?: {
                /** @description Desde (incluido), hora de Córdoba */
                from?: string;
                /** @description Hasta (incluido), hora de Córdoba */
                to?: string;
                planId?: string;
                /** @description Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí */
                localityId?: string;
                groupBy?: "day" | "week" | "month" | "year";
            };
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevenueSummaryDto"];
                };
            };
        };
    };
    RevenueController_export_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Obligatorio salvo en GET */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevenueExportDto"];
            };
        };
        responses: {
            /** @description CSV (UTF-8 con BOM, separador ;, coma decimal) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
