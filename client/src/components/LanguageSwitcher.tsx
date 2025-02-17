import { Button } from "@/components/ui/button";
import { useI18n, type Language } from "@/lib/i18n";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className="min-w-[80px]"
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
