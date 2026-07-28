package com.glumbi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class EmailTemplates {

    @Value("${app.brand.name:Glumbi}")
    private String brandName;

    @Value("${app.brand.base-url:https://glumbi.com}")
    private String brandBaseUrl;

    @Value("${app.brand.logo-url:https://glumbi.com/logo.svg}")
    private String brandLogoUrl;

    @Value("${app.brand.privacy-url:https://glumbi.com/privacy}")
    private String brandPrivacyUrl;

    @Value("${app.brand.contact-url:https://glumbi.com/contact}")
    private String brandContactUrl;

    @Value("${app.brand.privacy-email:privacy@glumbi.com}")
    private String brandPrivacyEmail;

    @Value("${app.brand.auth-url:https://glumbi.com/auth}")
    private String brandAuthUrl;

    @Value("${app.brand.login-url:https://glumbi.com/login}")
    private String brandLoginUrl;

    private Context brandContext() {
        Context ctx = new Context();
        ctx.setVariable("brandName", brandName);
        ctx.setVariable("brandBaseUrl", brandBaseUrl);
        ctx.setVariable("brandLogoUrl", brandLogoUrl);
        ctx.setVariable("brandPrivacyUrl", brandPrivacyUrl);
        ctx.setVariable("brandContactUrl", brandContactUrl);
        ctx.setVariable("brandPrivacyEmail", brandPrivacyEmail);
        ctx.setVariable("brandAuthUrl", brandAuthUrl);
        ctx.setVariable("brandLoginUrl", brandLoginUrl);
        return ctx;
    }

    private static final List<String> NO_CHILD_MESSAGES = List.of(
        "It looks like you haven't added a child profile yet — it only takes a minute! Once you do, Glumbi will start creating personalised stories, games, and activities just for them.",
        "Your Glumbi account is all set up and ready to go! The next step is adding your child's profile so we can tailor everything to their age and interests.",
        "Glumbi is waiting for its first little explorer! Adding a child profile takes less than a minute and unlocks stories, drawing, curiosity questions, and more.",
        "Just a friendly wave from Glumbi — whenever you're ready, adding your child's profile is the first step to their personalised learning adventure.",
        "No rush at all, but whenever you're ready — adding a child profile is how the magic starts. Stories, games, and activities, all tailored just for them.",
        "Your account is ready! Once you add your child's profile, Glumbi will get to know them and start building their own little corner of the app.",
        "We noticed you haven't added a child yet — totally fine, life gets busy! Whenever the moment feels right, Glumbi is here and ready to meet them."
    );

    private static final List<String> QUIET_WEEK_MESSAGES = List.of(
        "Even the best explorers take a rest now and then! When {name} is ready, Glumbi will be right here waiting.",
        "A quiet week is totally fine — every great adventure needs a breather. See you next week!",
        "Sometimes the best learning happens away from the screen too. Hope {name} had a wonderful week!",
        "No Glumbi this week, and that's perfectly okay. When {name} dives back in, there's plenty waiting to explore.",
        "Rest weeks are part of the journey! {name} can pick up right where they left off whenever they're ready.",
        "Life gets busy — we get it! Whenever {name} wants to jump back in, Glumbi will be ready.",
        "Taking a break is just as important as learning. See you and {name} back soon!",
        "Every learner has quiet weeks. {name}'s progress is still there, ready to continue whenever the time is right."
    );

    private final TemplateEngine templateEngine;

    public EmailTemplates(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public String passwordReset(String resetUrl, boolean isAdmin) {
        Context ctx = brandContext();
        ctx.setVariable("resetUrl", resetUrl);
        ctx.setVariable("salutation", isAdmin ? "Dear Glumbi Admin," : "Dear Glumbi User,");
        return templateEngine.process("email/password-reset", ctx);
    }

    public String passwordChanged(String context, boolean isAdmin) {
        Context ctx = brandContext();
        ctx.setVariable("context", context);
        ctx.setVariable("salutation", isAdmin ? "Dear Glumbi Admin," : "Dear Glumbi User,");
        return templateEngine.process("email/password-changed", ctx);
    }

    public String accountOnHold() {
        return templateEngine.process("email/account-on-hold", brandContext());
    }

    public String accountReleased() {
        return templateEngine.process("email/account-released", brandContext());
    }

    public String accountDeletedByAdmin() {
        return templateEngine.process("email/account-deleted-by-admin", brandContext());
    }

    public String accountDeletedBySelf() {
        return templateEngine.process("email/account-deleted-self", brandContext());
    }

    public String quotaWarning(int usedPercent) {
        Context ctx = brandContext();
        ctx.setVariable("usedPercent", usedPercent);
        return templateEngine.process("email/quota-warning", ctx);
    }

    public String announcement(String headline, String bodyHtml) {
        Context ctx = brandContext();
        ctx.setVariable("headline", headline);
        ctx.setVariable("bodyHtml", bodyHtml);
        return templateEngine.process("email/announcement", ctx);
    }

    public String onboarding() {
        return templateEngine.process("email/onboarding", brandContext());
    }

    public String parentNotice() {
        return templateEngine.process("email/parent-notice", brandContext());
    }

    public String noChildAdded() {
        String message = NO_CHILD_MESSAGES.get(
            ThreadLocalRandom.current().nextInt(NO_CHILD_MESSAGES.size())
        );
        Context ctx = brandContext();
        ctx.setVariable("message", message);
        return templateEngine.process("email/no-child", ctx);
    }

    public String quietWeek(String childName) {
        String template = QUIET_WEEK_MESSAGES.get(
            ThreadLocalRandom.current().nextInt(QUIET_WEEK_MESSAGES.size())
        );
        Context ctx = brandContext();
        ctx.setVariable("childName", childName);
        ctx.setVariable("message", template.replace("{name}", childName));
        return templateEngine.process("email/quiet-week", ctx);
    }

    public String weeklyRecap(String childName, String recapText) {
        Context ctx = brandContext();
        ctx.setVariable("childName", childName);
        ctx.setVariable("recapHtml", recapText.replace("\n", "<br>"));
        return templateEngine.process("email/weekly-recap", ctx);
    }

    public String adminAlert(String headline, String bodyHtml) {
        Context ctx = brandContext();
        ctx.setVariable("headline", headline);
        ctx.setVariable("bodyHtml", bodyHtml);
        return templateEngine.process("email/admin-alert", ctx);
    }
}
