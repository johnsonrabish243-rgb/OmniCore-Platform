"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OrganizationOption {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
}

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  organizationId: string;
  type?: string | null;
}

export default function WorkspacesPage() {
  const t = useTranslations("workspaces");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [logoUrl, setLogoUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasWorkspaces = workspaces.length > 0;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [sessionRes, workspaceRes] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/admin/workspaces"),
      ]);

      if (!sessionRes.ok) {
        window.location.href = window.location.pathname.replace(/\/workspaces.*$/, "/login");
        return;
      }

      const sessionJson = await sessionRes.json();
      const profile = sessionJson.user;
      const orgs = profile?.organizations || [];
      setOrganizations(orgs);
      if (orgs.length === 1) {
        setSelectedOrganizationId(orgs[0].id);
      }

      if (workspaceRes.ok) {
        const workspaceJson = await workspaceRes.json();
        setWorkspaces(workspaceJson.workspaces || []);
      }
    } catch (error) {
      console.error("Workspaces load error:", error);
      setErrorMessage(t("loadError") || "Failed to load workspaces.");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectWorkspace(id: string) {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeWorkspaceId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || t("selectError") || "Unable to enter workspace.");
        return;
      }
      window.location.href = `${window.location.pathname.replace(/(\/workspaces).*$/, "/dashboard")}`;
    } catch (err) {
      console.error(err);
      setErrorMessage(t("selectError") || "Unable to enter workspace.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadLogo(file: File) {
    setIsUploadingLogo(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || t("logoUploadFailed") || "Unable to upload logo.");
        return;
      }
      setLogoUrl(data.url || "");
      setMessage(t("logoUploaded") || "Logo uploaded successfully.");
    } catch (err) {
      console.error(err);
      setErrorMessage(t("logoUploadFailed") || "Unable to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    if (!workspaceName.trim()) {
      setErrorMessage(t("workspaceNameRequired") || "Workspace name is required.");
      setIsSubmitting(false);
      return;
    }

    if (!selectedOrganizationId && !organizationName.trim()) {
      setErrorMessage(t("organizationNameRequired") || "Organization name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const body = {
        organizationId: selectedOrganizationId || undefined,
        organizationName: organizationName.trim() || undefined,
        workspaceName: workspaceName.trim(),
        industry: industry.trim() || undefined,
        country: country.trim() || undefined,
        currency: currency || undefined,
        language: language || undefined,
        timezone: timezone || undefined,
        logoUrl: logoUrl || undefined,
      };

      const res = await fetch("/api/workspaces/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || t("createError") || "Unable to create workspace.");
        return;
      }

      window.location.href = `${window.location.pathname.replace(/(\/workspaces).*$/, "/dashboard")}`;
    } catch (err) {
      console.error(err);
      setErrorMessage(t("createError") || "Unable to create workspace.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const organizationSelector = useMemo(() => {
    if (organizations.length <= 1) return null;
    return (
      <div className="space-y-2">
        <label htmlFor="organization" className="text-sm font-medium">
          {t("selectOrganization")}
        </label>
        <select
          id="organization"
          className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={selectedOrganizationId}
          onChange={(e) => setSelectedOrganizationId(e.target.value)}
        >
          <option value="">{t("chooseOrganization")}</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
    );
  }, [organizations, selectedOrganizationId, t]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-primary/80">{t("workspaceAccess")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">{t("loading")}</CardContent>
          </Card>
        ) : hasWorkspaces ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{t("availableWorkspaces")}</CardTitle>
                <CardDescription>{t("availableWorkspacesDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="rounded-[16px] border border-border/70 bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{workspace.name}</p>
                        <p className="text-sm text-muted-foreground">{workspace.slug}</p>
                      </div>
                      <Button onClick={() => selectWorkspace(workspace.id)} loading={isSubmitting}>
                        {t("enter")}
                      </Button>
                    </div>
                    {workspace.description ? <p className="mt-3 text-sm text-muted-foreground">{workspace.description}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("needNewWorkspace")}</CardTitle>
                <CardDescription>{t("createWorkspaceSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="lg" onClick={() => window.location.reload()}>
                  {t("refresh")}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{t("onboardingTitle")}</CardTitle>
              <CardDescription>{t("onboardingDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleCreateWorkspace}>
                {organizationSelector}

                {!selectedOrganizationId ? (
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="text-sm font-medium">
                      {t("organizationName")}
                    </label>
                    <Input
                      id="organizationName"
                      placeholder={t("organizationNamePlaceholder")}
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="workspaceName" className="text-sm font-medium">
                    {t("workspaceName")}
                  </label>
                  <Input
                    id="workspaceName"
                    placeholder={t("workspaceNamePlaceholder")}
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="industry" className="text-sm font-medium">{t("industry")}</label>
                    <Input id="industry" placeholder={t("industryPlaceholder")} value={industry} onChange={(e) => setIndustry(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">{t("country")}</label>
                    <Input id="country" placeholder={t("countryPlaceholder")} value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium">{t("currency")}</label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="language" className="text-sm font-medium">{t("language")}</label>
                    <select
                      id="language"
                      className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="sw">Kiswahili</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="timezone" className="text-sm font-medium">{t("timezone")}</label>
                    <Input id="timezone" placeholder={t("timezonePlaceholder")} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="logoUrl" className="text-sm font-medium">{t("logoUrl")}</label>
                  <Input
                    id="logoUrl"
                    placeholder={t("logoUrlPlaceholder")}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("logoUpload")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogo(file);
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>

                {message ? <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">{message}</div> : null}
                {errorMessage ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div> : null}

                <div className="flex flex-wrap gap-3 justify-end">
                  <Button type="submit" loading={isSubmitting}>
                    {t("createWorkspace")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
