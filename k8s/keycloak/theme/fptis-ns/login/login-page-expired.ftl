<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false pad="centered" showLogo=false stripe="error"; section>
  <#if section = "header">
    <@layout.statusIcon variant="error">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
    </@layout.statusIcon>
    <h1 class="ns-title ns-title--sm">${msg("nsExpiredTitle")}</h1>
    <p class="ns-subtitle ns-subtitle--relaxed">${msg("nsExpiredSubtitle")}</p>

  <#elseif section = "form">
    <div class="ns-stack">
      <a id="loginRestartLink" href="${url.loginRestartFlowUrl}" class="ns-btn ns-btn--primary">${msg("nsLoginAgain")}</a>
      <a id="loginContinueLink" href="${url.loginAction}" class="ns-btn ns-btn--ghost">${msg("nsReportToHelpdesk")}</a>
    </div>
    <span class="ns-ref">ref: KC-EXPIRED-408</span>
  </#if>
</@layout.registrationLayout>
