import type { Meta, StoryObj } from "@storybook/react";
import AddPropertiesStory from "./addpropertiesstory";

const meta: Meta<typeof AddPropertiesStory> = {
  title: "Pages/AddPropertiesStory",
  component: AddPropertiesStory,
  // La page occupe tout l'écran, pas besoin du padding par défaut de Storybook
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Version **statique** de la page "Ajouter une propriété" (sans \`useRouter\` ni client API réel),
utilisée pour le rendu dans Storybook.

### Comment ça fonctionne en production

1. **Compression d'image** — avant tout upload, chaque image (couverture, galerie, photo de
   l'hôte) passe par \`compressImage\` : ignorée si elle fait déjà moins de 300 Ko ou si c'est
   un SVG, sinon redimensionnée à 1920×1920 px maximum (ratio conservé) via un \`<canvas>\` puis
   réencodée en **WebP qualité 0.7** pour réduire son poids. En cas d'échec de l'API navigateur,
   le fichier d'origine est conservé tel quel.

2. **Upload des images** — chaque fichier compressé est envoyé en \`multipart/form-data\` vers
   \`POST /api/uploads/image\`, qui renvoie \`{ url }\`. Les trois uploads (couverture, galerie,
   photo de l'hôte) partent **en parallèle** (\`Promise.all\`) plutôt que les uns après les
   autres, pour limiter le temps d'attente total.

3. **Création de la propriété** — une fois toutes les URLs récupérées, le payload (titre,
   description, prix/nuit, localisation, hôte, images, équipements, tags) est envoyé via
   \`POST /api/properties\`. En cas de succès, redirection vers \`/properties/{id}\` ; en cas
   d'erreur, le message renvoyé par l'API est affiché (ou un message générique sinon).

4. **Équipements & tags** — gérés en état local, sans appel réseau jusqu'à la soumission
   finale, où ils sont inclus tels quels dans le payload.

### Dans cette story

\`useRouter\` et le client \`api\` réel sont remplacés par les props \`onBack\` / \`onSubmitSuccess\`,
et l'upload est simulé par \`mockUploadImage\` (délai + URL locale du fichier), sans aucune
requête réseau. Pour repasser en production, il suffit de réintroduire \`useRouter\` et les
appels à \`services/api\` vers \`/api/uploads/image\` et \`/api/properties\`.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onBack: { action: "back" },
    onSubmitSuccess: { action: "submit-success" },
  },
};

export default meta;
type Story = StoryObj<typeof AddPropertiesStory>;

// État par défaut : formulaire vide, prêt à être rempli dans les controls/canvas
export const Default: Story = {
  args: {
    onBack: () => console.log("[Storybook] Retour cliqué"),
    onSubmitSuccess: (id: string) =>
      console.log("[Storybook] Soumission simulée réussie, id :", id),
  },
};

// Variante avec quelques champs déjà renseignés, pratique pour visualiser
// la mise en page une fois le formulaire partiellement rempli.
export const Prefilled: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const titleInput = canvasElement.querySelector<HTMLInputElement>("#title");
    const priceInput = canvasElement.querySelector<HTMLInputElement>(
      "#price-per-night"
    );
    const postalCodeInput = canvasElement.querySelector<HTMLInputElement>(
      "#postal-code"
    );
    const locationInput =
      canvasElement.querySelector<HTMLInputElement>("#location");

    const setValue = (
      input: HTMLInputElement | null,
      value: string
    ) => {
      if (!input) return;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    setValue(titleInput, "Appartement cosy au coeur de Paris");
    setValue(priceInput, "120");
    setValue(postalCodeInput, "75011");
    setValue(locationInput, "Paris");
  },
};