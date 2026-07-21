package com.glumbi.service;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Component
public class EmailTemplates {

    private final TemplateEngine templateEngine;

    public EmailTemplates(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public String passwordReset(String name, String resetUrl) {
        Context ctx = new Context();
        ctx.setVariable("name", (name != null && !name.isBlank()) ? name : "there");
        ctx.setVariable("resetUrl", resetUrl);
        return templateEngine.process("email/password-reset", ctx);
    }

    public String passwordChanged(String name, String context) {
        Context ctx = new Context();
        ctx.setVariable("name", (name != null && !name.isBlank()) ? name : "there");
        ctx.setVariable("context", context);
        return templateEngine.process("email/password-changed", ctx);
    }

    public String weeklyRecap(String parentName, String childName, String recapText) {
        Context ctx = new Context();
        ctx.setVariable("parentName", (parentName != null && !parentName.isBlank()) ? parentName : "there");
        ctx.setVariable("childName", childName);
        ctx.setVariable("recapHtml", recapText.replace("\n", "<br>"));
        return templateEngine.process("email/weekly-recap", ctx);
    }
}
