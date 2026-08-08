<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=(realm.password && realm.registrationAllowed && !registrationDisabled??) showFooter=true; section>
  <#if section = "header">
    <h1 class="ns-title">${msg("nsLoginTitle")}</h1>
    <p class="ns-subtitle">${msg("nsLoginSubtitle")}</p>

  <#elseif section = "form">
    <#-- ===== IdP block (only when identity providers are configured) ===== -->
    <#if realm.password && social?? && social.providers?? && social.providers?has_content>
      <div class="ns-idp-group">
        <#list social.providers as p>
          <a id="social-${p.alias}" href="${p.loginUrl}" class="ns-idp ns-idp--${p.alias?lower_case}">
            <#if p.alias?lower_case?contains('microsoft') || p.alias?lower_case?contains('entra') || p.alias?lower_case?contains('azure')>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="0" y="0" width="7" height="7" fill="#F25022"></rect><rect x="9" y="0" width="7" height="7" fill="#7FBA00"></rect><rect x="0" y="9" width="7" height="7" fill="#00A4EF"></rect><rect x="9" y="9" width="7" height="7" fill="#FFB900"></rect></svg>
            <#elseif p.alias?lower_case?contains('google')>
              <span class="ns-g">G</span>
            <#elseif p.alias?lower_case?contains('ldap') || p.alias?lower_case?contains('ad')>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="15.5" r="4.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path></svg>
            <#else>
              <span class="ns-idp-dot"></span>
            </#if>
            <span>${msg("nsContinueWith")} ${p.displayName!p.alias}</span>
          </a>
        </#list>
      </div>
      <#if realm.password>
        <div class="ns-divider"><span class="ns-divider-line"></span><span class="ns-divider-text">${msg("nsOrLocalAccount")}</span><span class="ns-divider-line"></span></div>
      </#if>
    </#if>

    <#-- ===== Local account form (always shown when realm.password) ===== -->
    <#if realm.password>
      <div class="ns-badge-row">
        <span class="ns-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10" rx="2"></rect><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"></path></svg>
          ${msg("nsLocalAccount")}
        </span>
        <span class="ns-badge-note">${msg("nsLocalAccountNote")}</span>
      </div>

      <form id="kc-form-login" class="ns-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
        <div class="ns-field">
          <label for="username" class="ns-label"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
          <input tabindex="1" id="username" class="ns-input <#if messagesPerField.existsError('username','password')>ns-input--error</#if>" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username" placeholder="tennv@fpt.com" dir="ltr" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>">
          <#if messagesPerField.existsError('username','password')>
            <span id="input-error" class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
          </#if>
        </div>

        <div class="ns-field">
          <label for="password" class="ns-label">${msg("password")}</label>
          <div class="ns-pw-wrap">
            <input tabindex="2" id="password" class="ns-input ns-input--pw <#if messagesPerField.existsError('username','password')>ns-input--error</#if>" name="password" type="password" autocomplete="current-password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>">
            <button class="ns-pw-toggle" type="button" aria-label="${msg('nsShowPassword')}" data-pw-toggle data-target="password"
              data-label-show="${msg('nsShowPassword')}" data-label-hide="${msg('nsHidePassword')}">
              <svg class="ns-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg class="ns-eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none"><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6C3.9 8.2 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 4.4-1"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path><path d="m2 2 20 20"></path></svg>
            </button>
          </div>
        </div>

        <div class="ns-row-between">
          <#if realm.rememberMe && !usernameHidden??>
            <label class="ns-check">
              <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>${msg("rememberMe")}
            </label>
          <#else>
            <span></span>
          </#if>
          <#if realm.resetPasswordAllowed>
            <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="ns-link">${msg("doForgotPassword")}</a>
          </#if>
        </div>

        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>>
        <button tabindex="4" class="ns-btn ns-btn--primary" name="login" id="kc-login" type="submit">${msg("doLogIn")}</button>
      </form>
    </#if>

  <#elseif section = "info">
    <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
      <p class="ns-info-line">${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}" class="ns-link ns-link--strong">${msg("doRegister")}</a></p>
    </#if>
  </#if>
</@layout.registrationLayout>
