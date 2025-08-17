import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Edit3, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "yumi" | "user";
  content: string;
  timestamp: Date;
  type?: "question" | "answer" | "options" | "confirmation";
}

interface FormData {
  epId: string;
  promotionInfo: string;
  productUrl: string;
  lifestyleImage: string;
  disclaimer: string;
  channels: string[];
}

const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    questions: [
      {
        id: 1,
        text: "Hi there! I'm Yumi, your promotional content designer. I'm excited to help you create amazing promotional content! 🎨\n\nLet's start with the basics - could you please provide your EP ID? This will be the email address where you'll receive the final deliverables.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "Perfect! Now, tell me about this promotion. I'd love to help you craft the perfect copy! Please share:\n\n• Brief promotion details\n• Specific discount rates and products you'd like highlighted\n• Any copy you already have in mind\n\nThe more details you give me, the better I can tailor the copywriting to match your vision perfectly!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "Awesome! We're almost there. Now I need the PDP URL of the product you want to feature. Please copy and paste the product page URL here.\n\n(Currently, we can showcase one product per promotional content)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "Great choice! Now, let's talk about the lifestyle imagery. What kind of vibe or people would you like to see in the lifestyle images?\n\nJust give me a rough description and I'll generate something amazing for you! Think about the mood, setting, or type of person that would best represent your product.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "Perfect! Do you need any disclaimers included in the promotional content? If so, please provide the exact text you'd like to include.\n\nIf not, just type 'None' and we'll move on to the next step.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "Almost done! Last question - where will this promotional content be published? Please select all the channels that apply:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "Perfect! Let me show you everything you've provided. Please review all the details below and confirm when you're ready to proceed:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continue",
      confirmProceed: "Confirm & Proceed",
      enterYourId: "Enter your ID",
      typeResponse: "Type your response here...",
      confirmed: "Confirmed! Please proceed with creating the promotional content.",
      successMessage: "Excellent! I've received all your details and sent them to our content creation system. You'll receive the final deliverables at your provided email address. Thank you for working with me! 🎉"
    }
  },
  ko: {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    questions: [
      {
        id: 1,
        text: "안녕하세요! 저는 프로모션 콘텐츠 디자이너 유미입니다. 멋진 프로모션 콘텐츠를 만들어드릴 수 있어서 기쁩니다! 🎨\n\n기본 정보부터 시작하겠습니다. EP ID를 알려주시겠어요? 최종 결과물을 받으실 이메일 주소입니다.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "완벽합니다! 이제 이번 프로모션에 대해 알려주세요. 완벽한 카피를 작성하는데 도움이 되도록 다음 내용을 공유해 주세요:\n\n• 프로모션 간단 소개\n• 구체적인 할인율과 강조하고 싶은 제품\n• 이미 생각해두신 카피가 있다면\n\n자세한 내용을 알려주실수록 귀하의 비전에 완벽하게 맞는 카피라이팅을 만들어드릴 수 있습니다!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "훌륭합니다! 거의 다 왔어요. 이제 특집하고 싶은 제품의 PDP URL이 필요합니다. 제품 페이지 URL을 복사해서 붙여넣어 주세요.\n\n(현재 프로모션 콘텐츠당 하나의 제품을 소개할 수 있습니다)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "좋은 선택이네요! 이제 라이프스타일 이미지에 대해 이야기해볼까요? 라이프스타일 이미지에서 어떤 분위기나 사람들을 보고 싶으신가요?\n\n대략적인 설명만 해주시면 멋진 이미지를 생성해드리겠습니다! 제품을 가장 잘 나타낼 수 있는 분위기, 설정, 또는 사람의 유형을 생각해보세요.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "완벽합니다! 프로모션 콘텐츠에 포함해야 할 면책 조항이 있나요? 있으시다면 포함하고 싶은 정확한 텍스트를 제공해 주세요.\n\n없으시다면 '없음'이라고 입력하시고 다음 단계로 넘어가겠습니다.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "거의 끝났어요! 마지막 질문입니다 - 이 프로모션 콘텐츠는 어디에 게시될 예정인가요? 해당하는 모든 채널을 선택해 주세요:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "완벽합니다! 제공해주신 모든 내용을 보여드리겠습니다. 아래 세부사항을 검토하시고 진행할 준비가 되면 확인해 주세요:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "계속하기",
      confirmProceed: "확인 및 진행",
      enterYourId: "ID를 입력하세요",
      typeResponse: "답변을 입력하세요...",
      confirmed: "확인되었습니다! 프로모션 콘텐츠 제작을 진행해주세요.",
      successMessage: "훌륭합니다! 모든 세부사항을 받았으며 콘텐츠 제작 시스템으로 전송했습니다. 제공해주신 이메일 주소로 최종 결과물을 받으실 수 있습니다. 함께 작업해주셔서 감사합니다! 🎉"
    }
  },
  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    questions: [
      {
        id: 1,
        text: "¡Hola! Soy Yumi, tu diseñadora de contenido promocional. ¡Estoy emocionada de ayudarte a crear contenido promocional increíble! 🎨\n\nEmpecemos con lo básico: ¿podrías proporcionarme tu ID de EP? Esta será la dirección de correo electrónico donde recibirás los entregables finales.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "¡Perfecto! Ahora cuéntame sobre esta promoción. ¡Me encantaría ayudarte a crear el texto perfecto! Por favor comparte:\n\n• Detalles breves de la promoción\n• Tasas de descuento específicas y productos que te gustaría destacar\n• Cualquier texto que ya tengas en mente\n\n¡Cuantos más detalles me des, mejor podré adaptar el copywriting para que coincida perfectamente con tu visión!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "¡Increíble! Ya casi llegamos. Ahora necesito la URL PDP del producto que quieres destacar. Por favor copia y pega la URL de la página del producto aquí.\n\n(Actualmente, podemos mostrar un producto por contenido promocional)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "¡Excelente elección! Ahora hablemos sobre las imágenes de estilo de vida. ¿Qué tipo de ambiente o personas te gustaría ver en las imágenes de estilo de vida?\n\n¡Solo dame una descripción aproximada y generaré algo increíble para ti! Piensa en el estado de ánimo, el entorno o el tipo de persona que mejor representaría tu producto.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "¡Perfecto! ¿Necesitas incluir alguna exención de responsabilidad en el contenido promocional? Si es así, proporciona el texto exacto que te gustaría incluir.\n\nSi no, simplemente escribe 'Ninguna' y pasaremos al siguiente paso.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "¡Casi terminamos! Última pregunta: ¿dónde se publicará este contenido promocional? Por favor selecciona todos los canales que apliquen:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "¡Perfecto! Te muestro todo lo que has proporcionado. Por favor revisa todos los detalles a continuación y confirma cuando estés listo para proceder:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continuar",
      confirmProceed: "Confirmar y proceder",
      enterYourId: "Ingresa tu ID",
      typeResponse: "Escribe tu respuesta aquí...",
      confirmed: "¡Confirmado! Por favor procede con la creación del contenido promocional.",
      successMessage: "¡Excelente! He recibido todos tus detalles y los he enviado a nuestro sistema de creación de contenido. Recibirás los entregables finales en tu dirección de correo electrónico proporcionada. ¡Gracias por trabajar conmigo! 🎉"
    }
  },
  de: {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    questions: [
      {
        id: 1,
        text: "Hallo! Ich bin Yumi, deine Designerin für Werbeinhalte. Ich freue mich darauf, dir dabei zu helfen, großartige Werbeinhalte zu erstellen! 🎨\n\nLass uns mit den Grundlagen beginnen - könntest du mir bitte deine EP-ID geben? Das wird die E-Mail-Adresse sein, an die du die finalen Ergebnisse erhältst.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "Perfekt! Erzähl mir jetzt von dieser Promotion. Ich würde gerne dabei helfen, den perfekten Text zu erstellen! Bitte teile mit:\n\n• Kurze Promotion-Details\n• Spezifische Rabattsätze und Produkte, die du hervorheben möchtest\n• Jegliche Texte, die du bereits im Kopf hast\n\nJe mehr Details du mir gibst, desto besser kann ich das Copywriting an deine Vision anpassen!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "Großartig! Wir sind fast da. Jetzt brauche ich die PDP-URL des Produkts, das du hervorheben möchtest. Bitte kopiere und füge die Produktseiten-URL hier ein.\n\n(Derzeit können wir ein Produkt pro Werbeinhalt präsentieren)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "Großartige Wahl! Lass uns jetzt über die Lifestyle-Bilder sprechen. Welche Art von Atmosphäre oder Menschen möchtest du in den Lifestyle-Bildern sehen?\n\nGib mir einfach eine grobe Beschreibung und ich werde etwas Erstaunliches für dich generieren! Denk an die Stimmung, Umgebung oder Art von Person, die dein Produkt am besten repräsentieren würde.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "Perfekt! Benötigst du irgendwelche Haftungsausschlüsse im Werbeinhalt? Falls ja, gib bitte den genauen Text an, den du einschließen möchtest.\n\nWenn nicht, schreibe einfach 'Keine' und wir gehen zum nächsten Schritt über.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "Fast fertig! Letzte Frage - wo wird dieser Werbeinhalt veröffentlicht? Bitte wähle alle zutreffenden Kanäle aus:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "Perfekt! Lass mich dir alles zeigen, was du angegeben hast. Bitte überprüfe alle Details unten und bestätige, wenn du bereit bist fortzufahren:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Weiter",
      confirmProceed: "Bestätigen und fortfahren",
      enterYourId: "Gib deine ID ein",
      typeResponse: "Schreibe deine Antwort hier...",
      confirmed: "Bestätigt! Bitte fahre mit der Erstellung des Werbeinhalts fort.",
      successMessage: "Ausgezeichnet! Ich habe alle deine Details erhalten und sie an unser Content-Erstellungssystem gesendet. Du erhältst die finalen Ergebnisse an deine angegebene E-Mail-Adresse. Danke für die Zusammenarbeit! 🎉"
    }
  },
  fr: {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    questions: [
      {
        id: 1,
        text: "Salut ! Je suis Yumi, votre conceptrice de contenu promotionnel. Je suis ravie de vous aider à créer un contenu promotionnel fantastique ! 🎨\n\nCommençons par les bases - pourriez-vous me donner votre ID EP ? Ce sera l'adresse e-mail où vous recevrez les livrables finaux.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "Parfait ! Maintenant, parlez-moi de cette promotion. J'aimerais vous aider à créer le texte parfait ! Veuillez partager :\n\n• Détails brefs de la promotion\n• Taux de remise spécifiques et produits que vous aimeriez mettre en avant\n• Tout texte que vous avez déjà en tête\n\nPlus vous me donnez de détails, mieux je peux adapter la rédaction pour correspondre parfaitement à votre vision !",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "Génial ! Nous y sommes presque. Maintenant j'ai besoin de l'URL PDP du produit que vous voulez mettre en avant. Veuillez copier et coller l'URL de la page produit ici.\n\n(Actuellement, nous pouvons présenter un produit par contenu promotionnel)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "Excellent choix ! Maintenant, parlons des images de style de vie. Quel type d'ambiance ou de personnes aimeriez-vous voir dans les images de style de vie ?\n\nDonnez-moi juste une description approximative et je générerai quelque chose d'incroyable pour vous ! Pensez à l'ambiance, au cadre ou au type de personne qui représenterait le mieux votre produit.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "Parfait ! Avez-vous besoin d'inclure des clauses de non-responsabilité dans le contenu promotionnel ? Si oui, veuillez fournir le texte exact que vous aimeriez inclure.\n\nSinon, tapez simplement 'Aucune' et nous passerons à l'étape suivante.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "Presque fini ! Dernière question - où ce contenu promotionnel sera-t-il publié ? Veuillez sélectionner tous les canaux qui s'appliquent :",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "Parfait ! Laissez-moi vous montrer tout ce que vous avez fourni. Veuillez examiner tous les détails ci-dessous et confirmer quand vous êtes prêt à procéder :",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continuer",
      confirmProceed: "Confirmer et procéder",
      enterYourId: "Entrez votre ID",
      typeResponse: "Tapez votre réponse ici...",
      confirmed: "Confirmé ! Veuillez procéder à la création du contenu promotionnel.",
      successMessage: "Excellent ! J'ai reçu tous vos détails et les ai envoyés à notre système de création de contenu. Vous recevrez les livrables finaux à votre adresse e-mail fournie. Merci de travailler avec moi ! 🎉"
    }
  },
  ja: {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
    questions: [
      {
        id: 1,
        text: "こんにちは！私はプロモーションコンテンツデザイナーのYumiです。素晴らしいプロモーションコンテンツの作成をお手伝いできて嬉しいです！🎨\n\n基本的なことから始めましょう - EP IDを教えていただけますか？これが最終成果物を受け取るメールアドレスになります。",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "完璧です！今度はこのプロモーションについて教えてください。完璧なコピーを作成するお手伝いをしたいと思います！以下を共有してください：\n\n• プロモーションの簡単な詳細\n• 具体的な割引率とハイライトしたい商品\n• すでに考えているコピーがあれば\n\n詳細を教えていただくほど、あなたのビジョンに完璧に合うコピーライティングを作成できます！",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "素晴らしい！もうすぐです。今度は特集したい商品のPDP URLが必要です。商品ページのURLをコピーしてここに貼り付けてください。\n\n（現在、プロモーションコンテンツごとに1つの商品を紹介できます）",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "素晴らしい選択です！今度はライフスタイル画像について話しましょう。ライフスタイル画像でどのような雰囲気や人々を見たいですか？\n\n大まかな説明をしてくだされば、素晴らしいものを生成します！あなたの商品を最もよく表現する雰囲気、設定、または人のタイプを考えてみてください。",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "完璧です！プロモーションコンテンツに含める免責事項はありますか？ある場合は、含めたい正確なテキストを提供してください。\n\nない場合は、「なし」と入力して次のステップに進みましょう。",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "ほぼ完了です！最後の質問 - このプロモーションコンテンツはどこに公開されますか？該当するすべてのチャンネルを選択してください：",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "完璧です！提供していただいたすべての内容をお見せします。以下の詳細をご確認いただき、準備ができたら確認してください：",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "続行",
      confirmProceed: "確認して進行",
      enterYourId: "IDを入力してください",
      typeResponse: "こちらに回答を入力してください...",
      confirmed: "確認されました！プロモーションコンテンツの作成を進めてください。",
      successMessage: "素晴らしい！すべての詳細を受け取り、コンテンツ作成システムに送信しました。提供されたメールアドレスで最終成果物を受け取ります。一緒に作業していただき、ありがとうございます！🎉"
    }
  },
  zh: {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
    questions: [
      {
        id: 1,
        text: "你好！我是Yumi，你的推广内容设计师。我很兴奋能帮助你创建令人惊叹的推广内容！🎨\n\n让我们从基础开始 - 你能提供你的EP ID吗？这将是你接收最终交付成果的电子邮件地址。",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "完美！现在告诉我关于这个推广的信息。我很想帮你制作完美的文案！请分享：\n\n• 推广的简要详情\n• 具体的折扣率和你想突出的产品\n• 你已经想到的任何文案\n\n你给我的细节越多，我就能更好地量身定制文案来完美匹配你的愿景！",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "太棒了！我们快到了。现在我需要你想要特色展示的产品的PDP URL。请在这里复制粘贴产品页面URL。\n\n（目前，我们可以在每个推广内容中展示一个产品）",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "很好的选择！现在让我们谈论生活方式图像。你希望在生活方式图像中看到什么样的氛围或人物？\n\n给我一个大概的描述，我会为你生成令人惊叹的内容！想想最能代表你产品的心情、环境或人物类型。",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "완벽합니다! 홍보 콘텐츠에 면책 조항을 포함해야 합니까? 필요한 경우 포함하고 싶은 정확한 텍스트를 제공해 주세요.\n\n필요하지 않다면 '없음'이라고 입력하시면 다음 단계로 진행하겠습니다.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "快完成了！最后一个问题 - 这个推广内容将在哪里发布？请选择所有适用的渠道：",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "完美！让我展示你提供的所有内容。请查看下面的所有详细信息，准备好后确认：",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "继续",
      confirmProceed: "确认并继续",
      enterYourId: "输入你的ID",
      typeResponse: "在这里输入你的回复...",
      confirmed: "已确认！请继续创建推广内容。",
      successMessage: "太棒了！我已经收到了你的所有详细信息并发送到我们的内容创建系统。你将在提供的电子邮件地址收到最终交付成果。感谢与我合作！🎉"
    }
  },
  ru: {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
    questions: [
      {
        id: 1,
        text: "Привет! Я Юми, ваш дизайнер рекламного контента. Я рада помочь вам создать потрясающий рекламный контент! 🎨\n\nДавайте начнем с основ - не могли бы вы предоставить свой EP ID? Это будет адрес электронной почты, на который вы получите финальные материалы.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        text: "Отлично! Теперь расскажите мне об этой акции. Я бы хотела помочь вам создать идеальный текст! Пожалуйста, поделитесь:\n\n• Краткие детали акции\n• Конкретные скидки и продукты, которые вы хотели бы выделить\n• Любой текст, который у вас уже есть в голове\n\nЧем больше деталей вы мне дадите, тем лучше я смогу адаптировать копирайтинг под ваше видение!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        text: "Потрясающе! Мы почти у цели. Теперь мне нужен PDP URL продукта, который вы хотите представить. Пожалуйста, скопируйте и вставьте URL страницы продукта здесь.\n\n(В настоящее время мы можем представить один продукт на рекламный контент)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        text: "Отличный выбор! Теперь давайте поговорим о лайфстайл-изображениях. Какую атмосферу или людей вы хотели бы видеть в лайфстайл-изображениях?\n\nПросто дайте мне примерное описание, и я создам что-то потрясающее для вас! Подумайте о настроении, обстановке или типе человека, который лучше всего представил бы ваш продукт.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        text: "Отлично! Нужны ли вам какие-либо отказы от ответственности в рекламном контенте? Если да, пожалуйста, предоставьте точный текст, который вы хотели бы включить.\n\nЕсли нет, просто напечатайте 'Нет' и мы перейдем к следующему шагу.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        text: "Почти готово! Последний вопрос - где будет опубликован этот рекламный контент? Пожалуйста, выберите все применимые каналы:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        text: "Отлично! Позвольте мне показать все, что вы предоставили. Пожалуйста, просмотрите все детали ниже и подтвердите, когда будете готовы продолжить:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Продолжить",
      confirmProceed: "Подтвердить и продолжить",
      enterYourId: "Введите ваш ID",
      typeResponse: "Введите ваш ответ здесь...",
      confirmed: "Подтверждено! Пожалуйста, продолжите с созданием рекламного контента.",
      successMessage: "Отлично! Я получила все ваши детали и отправила их в нашу систему создания контента. Вы получите финальные материалы на предоставленный адрес электронной почты. Спасибо за работу со мной! 🎉"
    }
  }
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    epId: "",
    promotionInfo: "",
    productUrl: "",
    lifestyleImage: "",
    disclaimer: "",
    channels: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLanguageData = languages[currentLanguage];
  const questions = currentLanguageData.questions;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial message from Yumi
    const welcomeMessage: Message = {
      id: "welcome",
      sender: "yumi",
      content: currentLanguageData.questions[0].text,
      timestamp: new Date(),
      type: "question"
    };
    setMessages([welcomeMessage]);
  }, [currentLanguageData]);

  // Reset messages when language changes
  useEffect(() => {
    if (currentQuestion === 0 && messages.length > 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        sender: "yumi",
        content: currentLanguageData.questions[0].text,
        timestamp: new Date(),
        type: "question"
      };
      setMessages([welcomeMessage]);
    }
  }, [currentLanguage]);

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (currentQuestion < 6) {
      // Add user's answer
      const userContent = questions[currentQuestion].inputType === "checkbox" 
        ? selectedChannels.join(", ") 
        : currentQuestion === 0 // First question (EP ID)
          ? `${currentInput}@lge.com`
          : currentInput;
          
      const userMessage: Message = {
        id: `user-${currentQuestion}`,
        sender: "user",
        content: userContent,
        timestamp: new Date(),
        type: "answer"
      };

      // Update form data
      const field = questions[currentQuestion].field;
      if (field) {
        const value = questions[currentQuestion].inputType === "checkbox" 
          ? selectedChannels 
          : currentQuestion === 0 // First question (EP ID)
            ? `${currentInput}@lge.com`
            : currentInput;
        
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }

      setMessages(prev => [...prev, userMessage]);
      
      // Clear input
      setCurrentInput("");
      setSelectedChannels([]);
      
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      
      // Add Yumi's next question after a delay
      setTimeout(() => {
        simulateTyping();
        setTimeout(() => {
          const nextMessage: Message = {
            id: `yumi-${currentQuestion + 1}`,
            sender: "yumi",
            content: questions[currentQuestion + 1].text,
            timestamp: new Date(),
            type: "question"
          };
          setMessages(prev => [...prev, nextMessage]);
        }, 1000);
      }, 500);
    } else {
      // Final confirmation - send data to webhook
      const userMessage: Message = {
        id: "final-confirm",
        sender: "user",
        content: currentLanguageData.ui.confirmed,
        timestamp: new Date(),
        type: "answer"
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send data to n8n webhook
      try {
        const webhookUrl = "https://dev.eaip.lge.com/n8n/webhook/9cd2cbaf-1f04-4d71-ac24-fad9a247dabd";
        
        const payload = {
          epId: formData.epId,
          promotionInfo: formData.promotionInfo,
          productUrl: formData.productUrl,
          lifestyleImage: formData.lifestyleImage,
          disclaimer: formData.disclaimer,
          channels: formData.channels,
          timestamp: new Date().toISOString()
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(payload),
        });

        console.log("Data sent to webhook:", payload);
      } catch (error) {
        console.error("Failed to send data to webhook:", error);
      }
      
      // Success message
      setTimeout(() => {
        const successMessage: Message = {
          id: "success",
          sender: "yumi",
          content: currentLanguageData.ui.successMessage,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }, 1000);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const renderInput = () => {
    const question = questions[currentQuestion];
    
    if (currentQuestion >= 7) return null;

    if (question.inputType === "checkbox") {
      return (
        <div className="space-y-3">
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={selectedChannels.includes(option)}
                onCheckedChange={() => handleChannelToggle(option)}
              />
              <label htmlFor={option} className="text-sm font-medium">
                {option}
              </label>
            </div>
          ))}
          <Button 
            onClick={handleSubmit}
            disabled={selectedChannels.length === 0}
            className="w-full mt-4"
          >
            <Send className="w-4 h-4 mr-2" />
            {currentLanguageData.ui.continue}
          </Button>
        </div>
      );
    }

    if (question.inputType === "confirmation") {
      return (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
            <div><strong>EP ID:</strong> {formData.epId}</div>
            <div><strong>Promotion Info:</strong> {formData.promotionInfo}</div>
            <div><strong>Product URL:</strong> {formData.productUrl}</div>
            <div><strong>Lifestyle Image:</strong> {formData.lifestyleImage}</div>
            <div><strong>Disclaimer:</strong> {formData.disclaimer}</div>
            <div><strong>Channels:</strong> {formData.channels.join(", ")}</div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {currentLanguageData.ui.confirmProceed}
          </Button>
        </div>
      );
    }

    if (question.inputType === "textarea") {
      return (
        <div className="flex gap-2">
          <Textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={currentLanguageData.ui.typeResponse}
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (currentInput.trim()) handleSubmit();
              }
            }}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!currentInput.trim()}
            size="icon"
            className="shrink-0 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    // Special handling for first question (EP ID with @lge.com)
    if (currentQuestion === 0) {
      return (
        <div className="flex gap-2">
          <div className="flex flex-1 items-center border border-input rounded-md bg-background">
            <Input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentLanguageData.ui.enterYourId}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentInput.trim()) {
                  handleSubmit();
                }
              }}
            />
            <span className="px-3 text-muted-foreground">@lge.com</span>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!currentInput.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Input
          type={question.inputType}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder={currentLanguageData.ui.typeResponse}
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentInput.trim()) {
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!currentInput.trim()}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                  alt="Yumi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-semibold">Yumi</h1>
                <p className="text-xs text-muted-foreground">Promotional Content Designer</p>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={currentLanguage} onValueChange={(value: keyof typeof languages) => setCurrentLanguage(value)}>
              <SelectTrigger className="w-32">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span>{currentLanguageData.flag}</span>
                    <span className="text-sm">{currentLanguageData.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languages).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "yumi" && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center shrink-0">
                  <img 
                    src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                    alt="Yumi"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "yumi"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.sender === "yumi" && message.type === "question" && (
                    <Edit3 className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  U
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                  alt="Yumi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {currentQuestion < 7 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t p-4">
            <div className="max-w-4xl mx-auto">
              {renderInput()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;