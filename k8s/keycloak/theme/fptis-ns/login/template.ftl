<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false stripe="brand" pad="form" showLogo=true showFooter=false>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'vi'}"<#if realm.internationalizationEnabled> dir="ltr"</#if>>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${(realm.displayName!msg("loginTitle",(realm.name!'')))}</title>
  <link rel="icon" href="${url.resourcesPath}/img/ns-logo.png" type="image/png">
  <#if properties.styles?has_content>
    <#list properties.styles?split(' ') as style>
      <link href="${url.resourcesPath}/${style}" rel="stylesheet">
    </#list>
  </#if>
  <script>
    window.NS_MSG = {
      strengthLabel: "${msg('nsPwStrengthLabel')?js_string}",
      levels: ["${msg('nsPwWeak')?js_string}", "${msg('nsPwFair')?js_string}", "${msg('nsPwStrong')?js_string}"]
    };
  </script>
  <#if properties.scripts?has_content>
    <#list properties.scripts?split(' ') as script>
      <script src="${url.resourcesPath}/${script}" defer></script>
    </#list>
  </#if>
</head>
<body class="ns-body ${bodyClass}">
  <div class="ns-wrap">
    <div class="ns-card">
      <div class="ns-stripe ns-stripe--${stripe}"></div>
      <div class="ns-card-body ns-card-body--${pad}">

        <#if showLogo>
          <@brandHeader/>
        </#if>

        <#-- Field-independent messages (login errors, forced-password notices, etc.) -->
        <#if displayMessage && message?? && (message.summary?has_content) && (message.type != 'warning' || !isAppInitiatedAction??)>
          <#assign mtype = message.type!'info'>
          <div class="ns-alert ns-alert--${mtype}" role="alert">
            <#if mtype == 'success'>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.5 2.5L16 9"></path></svg>
            <#elseif mtype == 'error'>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
            <#else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>
            </#if>
            <span class="ns-alert-text">${kcSanitize(message.summary)?no_esc}</span>
          </div>
        </#if>

        <#nested "header">
        <#nested "form">

        <#if displayInfo>
          <#nested "info">
        </#if>

      </div>

      <#if showFooter>
        <div class="ns-footer">
          <span>&copy; 2026 FPT IS &middot; Next Gen Service</span>
          <#if realm.internationalizationEnabled && locale?? && (locale.supported?size > 1)>
            <span class="ns-locale">
              <#list locale.supported as l><a href="${l.url}" class="<#if l.languageTag == locale.currentLanguageTag>ns-locale--active</#if>">${l.label}</a><#sep> &middot; </#list>
            </span>
          <#else>
            <span>${msg("nsFooterRight")}</span>
          </#if>
        </div>
      </#if>
    </div>
  </div>
</body>
</html>
</#macro>

<#-- Logo + FPT-IS wordmark block, reused on login / register / reset -->
<#macro brandHeader>
  <div class="ns-brand">
    <img src="${url.resourcesPath}/img/ns-logo.png" alt="FPT IS Next Gen Service" class="ns-logo">
    <span class="ns-wordmark">
      <span class="ns-wordmark-1">FPT-IS</span>
      <span class="ns-wordmark-2">NEXT GEN SERVICE</span>
    </span>
  </div>
</#macro>

<#-- Circular status icon for centered screens -->
<#macro statusIcon variant="info"><span class="ns-icon ns-icon--${variant}"><#nested></span></#macro>
