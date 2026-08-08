<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false showLogo=false; section>
  <#if section = "header">
    <h1 class="ns-title ns-title--tight">${msg("nsUpdatePwTitle")}</h1>

  <#elseif section = "form">
    <div class="ns-alert ns-alert--warning" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>
      <span class="ns-alert-text"><#if message?? && message.summary?has_content>${kcSanitize(message.summary)?no_esc}<#else>${msg("nsPwExpiredNotice")}</#if></span>
    </div>

    <form id="kc-passwd-update-form" class="ns-form" action="${url.loginAction}" method="post">
      <div class="ns-field">
        <label for="password-new" class="ns-label">${msg("passwordNew")}</label>
        <div class="ns-pw-wrap">
          <input type="password" id="password-new" class="ns-input ns-input--pw <#if messagesPerField.existsError('password','password-confirm')>ns-input--error</#if>" name="password-new" autofocus autocomplete="new-password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
            data-pw-strength data-meter="ns-pw-meter" data-meter-label="ns-pw-label">
          <button class="ns-pw-toggle" type="button" aria-label="${msg('nsShowPassword')}" data-pw-toggle data-target="password-new"
            data-label-show="${msg('nsShowPassword')}" data-label-hide="${msg('nsHidePassword')}">
            <svg class="ns-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg class="ns-eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none"><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6C3.9 8.2 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 4.4-1"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path><path d="m2 2 20 20"></path></svg>
          </button>
        </div>
        <div class="ns-pw-meter" id="ns-pw-meter"><span></span><span></span><span></span></div>
        <span class="ns-pw-label" id="ns-pw-label">${msg("nsPwHint")}</span>
        <#if messagesPerField.existsError('password')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password'))?no_esc}</span></#if>
      </div>

      <div class="ns-field">
        <label for="password-confirm" class="ns-label">${msg("passwordConfirm")}</label>
        <div class="ns-pw-wrap">
          <input type="password" id="password-confirm" class="ns-input ns-input--pw <#if messagesPerField.existsError('password-confirm')>ns-input--error</#if>" name="password-confirm" autocomplete="new-password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
          <button class="ns-pw-toggle" type="button" aria-label="${msg('nsShowPassword')}" data-pw-toggle data-target="password-confirm"
            data-label-show="${msg('nsShowPassword')}" data-label-hide="${msg('nsHidePassword')}">
            <svg class="ns-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg class="ns-eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none"><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6C3.9 8.2 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 4.4-1"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path><path d="m2 2 20 20"></path></svg>
          </button>
        </div>
        <#if messagesPerField.existsError('password-confirm')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span></#if>
      </div>

      <#if isAppInitiatedAction??>
        <label class="ns-check"><input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>${msg("logoutOtherSessions")}</label>
        <div class="ns-grid-2">
          <button class="ns-btn ns-btn--primary" type="submit">${msg("nsUpdatePwSubmit")}</button>
          <button class="ns-btn ns-btn--secondary" type="submit" name="cancel-aia" value="true">${msg("doCancel")}</button>
        </div>
      <#else>
        <label class="ns-check"><input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>${msg("logoutOtherSessions")}</label>
        <button class="ns-btn ns-btn--primary" type="submit">${msg("nsUpdatePwSubmit")}</button>
      </#if>
    </form>
  </#if>
</@layout.registrationLayout>
