<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=true showFooter=false; section>
  <#if section = "header">
    <h1 class="ns-title">${msg("nsRegisterTitle")}</h1>
    <p class="ns-subtitle">${msg("nsRegisterSubtitle")}</p>

  <#elseif section = "form">
    <form id="kc-register-form" class="ns-form" action="${url.registrationAction}" method="post">
      <div class="ns-grid-2">
        <div class="ns-field">
          <label for="firstName" class="ns-label">${msg("firstName")}</label>
          <input type="text" id="firstName" class="ns-input <#if messagesPerField.existsError('firstName')>ns-input--error</#if>" name="firstName" value="${(register.formData.firstName!'')}" placeholder="Nguyễn" autocomplete="given-name">
          <#if messagesPerField.existsError('firstName')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span></#if>
        </div>
        <div class="ns-field">
          <label for="lastName" class="ns-label">${msg("lastName")}</label>
          <input type="text" id="lastName" class="ns-input <#if messagesPerField.existsError('lastName')>ns-input--error</#if>" name="lastName" value="${(register.formData.lastName!'')}" placeholder="Văn A" autocomplete="family-name">
          <#if messagesPerField.existsError('lastName')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span></#if>
        </div>
      </div>

      <div class="ns-field">
        <label for="email" class="ns-label">${msg("nsCompanyEmail")}</label>
        <input type="email" id="email" class="ns-input <#if messagesPerField.existsError('email')>ns-input--error</#if>" name="email" value="${(register.formData.email!'')}" placeholder="annv@fpt.com" autocomplete="email" dir="ltr">
        <#if messagesPerField.existsError('email')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('email'))?no_esc}</span></#if>
      </div>

      <#if !realm.registrationEmailAsUsername>
        <div class="ns-field">
          <label for="username" class="ns-label">${msg("username")}</label>
          <input type="text" id="username" class="ns-input <#if messagesPerField.existsError('username')>ns-input--error</#if>" name="username" value="${(register.formData.username!'')}" placeholder="annv" autocomplete="username" dir="ltr">
          <#if messagesPerField.existsError('username')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('username'))?no_esc}</span></#if>
        </div>
      </#if>

      <#if passwordRequired??>
        <div class="ns-grid-2">
          <div class="ns-field">
            <label for="password" class="ns-label">${msg("password")}</label>
            <input type="password" id="password" class="ns-input <#if messagesPerField.existsError('password','password-confirm')>ns-input--error</#if>" name="password" autocomplete="new-password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
            <#if messagesPerField.existsError('password')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password'))?no_esc}</span></#if>
          </div>
          <div class="ns-field">
            <label for="password-confirm" class="ns-label">${msg("nsPasswordConfirmShort")}</label>
            <input type="password" id="password-confirm" class="ns-input <#if messagesPerField.existsError('password-confirm')>ns-input--error</#if>" name="password-confirm" autocomplete="new-password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
            <#if messagesPerField.existsError('password-confirm')><span class="ns-field-error" aria-live="polite">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span></#if>
          </div>
        </div>
      </#if>

      <#if recaptchaRequired??>
        <div class="ns-field"><div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div></div>
      </#if>

      <button class="ns-btn ns-btn--primary" type="submit">${msg("nsRegisterTitle")}</button>
    </form>

  <#elseif section = "info">
    <p class="ns-info-line">${msg("nsHaveAccount")} <a href="${url.loginUrl}" class="ns-link ns-link--strong">${msg("doLogIn")}</a></p>
  </#if>
</@layout.registrationLayout>
