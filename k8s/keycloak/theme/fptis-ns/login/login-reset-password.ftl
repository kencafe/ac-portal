<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username') displayInfo=true showLogo=false; section>
  <#if section = "header">
    <a href="${url.loginUrl}" class="ns-back">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
      ${msg("backToLogin")}
    </a>
    <h1 class="ns-title ns-title--tight">${msg("nsResetTitle")}</h1>
    <p class="ns-subtitle ns-subtitle--relaxed">${msg("nsResetSubtitle")}</p>

  <#elseif section = "form">
    <form id="kc-reset-password-form" class="ns-form" action="${url.loginAction}" method="post">
      <div class="ns-field">
        <label for="username" class="ns-label"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
        <input type="text" id="username" class="ns-input <#if messagesPerField.existsError('username')>ns-input--error</#if>" name="username" value="${(auth.attemptedUsername!'')}" autofocus placeholder="annv@fpt.com" dir="ltr" aria-invalid="<#if messagesPerField.existsError('username')>true</#if>">
        <#if messagesPerField.existsError('username')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('username'))?no_esc}</span></#if>
      </div>
      <button class="ns-btn ns-btn--primary" type="submit">${msg("nsResetSubmit")}</button>
    </form>

  <#elseif section = "info">
    <p class="ns-help-line">${msg("nsResetHelpPrefix")} <a href="mailto:it-helpdesk@fpt.com" class="ns-link">${msg("nsHelpdesk")}</a>.</p>
  </#if>
</@layout.registrationLayout>
