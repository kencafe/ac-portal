<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false pad="centered" showLogo=false; section>
  <#if section = "header">
    <@layout.statusIcon variant="success">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path><path d="m15 16 5-4-5-4"></path><path d="M20 12H9"></path></svg>
    </@layout.statusIcon>
    <h1 class="ns-title ns-title--sm">${msg("nsLogoutTitle")}</h1>
    <p class="ns-subtitle ns-subtitle--relaxed">${msg("nsLogoutSubtitle")}</p>

  <#elseif section = "form">
    <div class="ns-stack">
      <form class="ns-form ns-form--center" action="${url.logoutConfirmAction}" method="post">
        <input type="hidden" name="session_code" value="${logoutConfirm.code}">
        <#if logoutConfirm.skipLink>
        <#else>
          <#if client?? && client.baseUrl?has_content>
            <input type="hidden" name="client_id" value="${client.clientId}">
          </#if>
        </#if>
        <button class="ns-btn ns-btn--primary" type="submit" name="confirmLogout" id="kc-logout" value="true">${msg("nsLogoutConfirm")}</button>
      </form>
      <#if logoutConfirm.skipLink>
      <#elseif client?? && client.baseUrl?has_content>
        <a href="${client.baseUrl}" class="ns-btn ns-btn--secondary">${msg("nsBackHome")}</a>
      </#if>
    </div>
  </#if>
</@layout.registrationLayout>
