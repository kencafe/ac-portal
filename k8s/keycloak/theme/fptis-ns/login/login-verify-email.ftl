<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false pad="centered" showLogo=false; section>
  <#if section = "header">
    <@layout.statusIcon variant="info">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"></rect><path d="m3 7 9 6 9-6"></path></svg>
    </@layout.statusIcon>
    <h1 class="ns-title ns-title--sm">${msg("nsVerifyTitle")}</h1>
    <p class="ns-subtitle ns-subtitle--relaxed">${msg("nsVerifyInstruction", (user.email!''))?no_esc}</p>

  <#elseif section = "form">
    <#if url.loginAction??>
      <form class="ns-form ns-form--center" action="${url.loginAction}" method="post">
        <button class="ns-btn ns-btn--secondary" type="submit">${msg("nsVerifyResend")}</button>
      </form>
    </#if>
    <a href="${url.loginRestartFlowUrl}" class="ns-link ns-link--muted">${msg("backToLogin")}</a>
  </#if>
</@layout.registrationLayout>
