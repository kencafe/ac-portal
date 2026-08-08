<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false pad="centered" showLogo=false stripe="error"; section>
  <#if section = "header">
    <@layout.statusIcon variant="error">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
    </@layout.statusIcon>
    <h1 class="ns-title ns-title--sm">${msg("nsErrorTitle")}</h1>
    <p class="ns-subtitle ns-subtitle--relaxed"><#if message?? && message.summary?has_content>${kcSanitize(message.summary)?no_esc}<#else>${msg("nsErrorSubtitle")}</#if></p>

  <#elseif section = "form">
    <div class="ns-stack">
      <#if skipLink??>
      <#elseif client?? && client.baseUrl?has_content>
        <a href="${client.baseUrl}" class="ns-btn ns-btn--primary">${kcSanitize(msg("backToApplication"))?no_esc}</a>
      </#if>
      <a href="mailto:it-helpdesk@fpt.com" class="ns-btn ns-btn--ghost">${msg("nsReportToHelpdesk")}</a>
    </div>
    <span class="ns-ref">ref: KC-ERROR</span>
  </#if>
</@layout.registrationLayout>
