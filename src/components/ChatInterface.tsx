import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Send, Edit3, Globe, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
        reaction: "Hi there! I'm Yumi, your promotional content designer. 🎨",
        content: "I'm excited to help you create amazing promotional content!\n\nLet's start with the basics - could you please provide your EP ID? This will be the email address where you'll receive the final deliverables.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "Perfect! Now, tell me about this promotion.",
        content: "I'd love to help you craft the perfect copy! Please share:\n\n• Brief promotion details\n• Specific discount rates and products you'd like highlighted\n• Any copy you already have in mind\n\nThe more details you give me, the better I can tailor the copywriting to match your vision perfectly!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "Awesome! We're almost there.",
        content: "Now I need the PDP URL of the product you want to feature. Please copy and paste the product page URL here.\n\n(Currently, we can showcase one product per promotional content)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "Great choice! Now, let's talk about the lifestyle imagery.",
        content: "What kind of vibe or people would you like to see in the lifestyle images?\n\nJust give me a rough description and I'll generate something amazing for you! Think about the mood, setting, or type of person that would best represent your product.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "Perfect! Do you need any disclaimers included in the promotional content?",
        content: "If so, please provide the exact text you'd like to include.\n\nIf not, just type 'None' and we'll move on to the next step.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "Almost done! Last question.",
        content: "Where will this promotional content be published? Please select all the channels that apply:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "Perfect! Let me show you everything you've provided.",
        content: "Please review all the details below and confirm when you're ready to proceed:",
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
      successMessage: "Excellent! I've received all your details and sent them to our content creation system. You'll receive the final deliverables at your provided email address. Will get back to you soon! 🎉"
    }
  },
  ko: {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    questions: [
      {
        id: 1,
        reaction: "안녕하세요! 저는 프로모션 콘텐츠 디자이너 유미입니다. 🎨",
        content: "멋진 프로모션 콘텐츠를 만들어드릴 수 있어서 기쁩니다!\n\n기본 정보부터 시작하겠습니다. EP ID를 알려주시겠어요? 최종 결과물을 받으실 이메일 주소입니다.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "완벽합니다! 이제 이번 프로모션에 대해 알려주세요.",
        content: "완벽한 카피를 작성하는데 도움이 되도록 다음 내용을 공유해 주세요:\n\n• 프로모션 간단 소개\n• 구체적인 할인율과 강조하고 싶은 제품\n• 이미 생각해두신 카피가 있다면\n\n자세한 내용을 알려주실수록 귀하의 비전에 완벽하게 맞는 카피라이팅을 만들어드릴 수 있습니다!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "훌륭합니다! 거의 다 왔어요.",
        content: "이제 특집하고 싶은 제품의 PDP URL이 필요합니다. 제품 페이지 URL을 복사해서 붙여넣어 주세요.\n\n(현재 프로모션 콘텐츠당 하나의 제품을 소개할 수 있습니다)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "좋은 선택이네요! 이제 라이프스타일 이미지에 대해 이야기해볼까요?",
        content: "라이프스타일 이미지에서 어떤 분위기나 사람들을 보고 싱으신가요?\n\n대략적인 설명만 해주시면 멋진 이미지를 생성해드리겠습니다! 제품을 가장 잘 나타낼 수 있는 분위기, 설정, 또는 사람의 유형을 생각해보세요.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "완벽합니다! 프로모션 콘텐츠에 포함해야 할 면책 조항이 있나요?",
        content: "있으시다면 포함하고 싶은 정확한 텍스트를 제공해 주세요.\n\n없으시다면 '없음'이라고 입력하시고 다음 단계로 넘어가겠습니다.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "거의 끝났어요! 마지막 질문입니다.",
        content: "이 프로모션 콘텐츠는 어디에 게시될 예정인가요? 해당하는 모든 채널을 선택해 주세요:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "완벽합니다! 제공해주신 모든 내용을 보여드리겠습니다.",
        content: "아래 세부사항을 검토하시고 진행할 준비가 되면 확인해 주세요:",
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
      successMessage: "훌륭합니다! 모든 세부사항을 받았으며 콘텐츠 제작 시스템으로 전송했습니다. 제공해주신 이메일 주소로 최종 결과물을 받으실 수 있습니다. 빨리 작업하고 올게요! 🎉"
    }
  },
  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    questions: [
      {
        id: 1,
        reaction: "¡Hola! Soy Yumi, tu diseñadora de contenido promocional. 🎨",
        content: "¡Estoy emocionada de ayudarte a crear contenido promocional increíble!\n\nComencemos con lo básico: ¿podrías proporcionarme tu EP ID? Esta será la dirección de correo electrónico donde recibirás los entregables finales.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "¡Perfecto! Ahora, cuéntame sobre esta promoción.",
        content: "¡Me encantaría ayudarte a crear el copy perfecto! Por favor comparte:\n\n• Detalles breves de la promoción\n• Tasas de descuento específicas y productos que te gustaría destacar\n• Cualquier copy que ya tengas en mente\n\n¡Cuantos más detalles me proporciones, mejor podré adaptar el copywriting para que coincida perfectamente con tu visión!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "¡Genial! Ya casi llegamos.",
        content: "Ahora necesito la URL PDP del producto que quieres destacar. Por favor copia y pega la URL de la página del producto aquí.\n\n(Actualmente, podemos mostrar un producto por contenido promocional)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "¡Excelente elección! Ahora, hablemos de las imágenes de estilo de vida.",
        content: "¿Qué tipo de ambiente o personas te gustaría ver en las imágenes de estilo de vida?\n\n¡Solo dame una descripción aproximada y generaré algo increíble para ti! Piensa en el estado de ánimo, el entorno o el tipo de persona que mejor representaría tu producto.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "¡Perfecto! ¿Necesitas incluir algún descargo de responsabilidad en el contenido promocional?",
        content: "Si es así, por favor proporciona el texto exacto que te gustaría incluir.\n\nSi no, simplemente escribe 'Ninguno' y pasaremos al siguiente paso.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "¡Casi terminamos! Última pregunta.",
        content: "¿Dónde se publicará este contenido promocional? Por favor selecciona todos los canales que apliquen:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "¡Perfecto! Permíteme mostrarte todo lo que has proporcionado.",
        content: "Por favor revisa todos los detalles a continuación y confirma cuando estés listo para proceder:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continuar",
      confirmProceed: "Confirmar y Proceder",
      enterYourId: "Ingresa tu ID",
      typeResponse: "Escribe tu respuesta aquí...",
      confirmed: "¡Confirmado! Por favor procede con la creación del contenido promocional.",
      successMessage: "¡Excelente! He recibido todos tus detalles y los he enviado a nuestro sistema de creación de contenido. Recibirás los entregables finales en tu dirección de correo electrónico proporcionada. ¡Te responderé pronto! 🎉"
    }
  },
  fr: {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    questions: [
      {
        id: 1,
        reaction: "Salut ! Je suis Yumi, votre designer de contenu promotionnel. 🎨",
        content: "Je suis ravie de vous aider à créer un contenu promotionnel incroyable !\n\nCommençons par les bases - pourriez-vous me fournir votre EP ID ? Ce sera l'adresse email où vous recevrez les livrables finaux.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "Parfait ! Maintenant, parlez-moi de cette promotion.",
        content: "J'adorerais vous aider à créer le copy parfait ! Veuillez partager :\n\n• Détails brefs de la promotion\n• Taux de remise spécifiques et produits que vous aimeriez mettre en avant\n• Tout copy que vous avez déjà en tête\n\nPlus vous me donnez de détails, mieux je peux adapter le copywriting pour correspondre parfaitement à votre vision !",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "Génial ! Nous y sommes presque.",
        content: "Maintenant j'ai besoin de l'URL PDP du produit que vous voulez mettre en avant. Veuillez copier et coller l'URL de la page produit ici.\n\n(Actuellement, nous pouvons présenter un produit par contenu promotionnel)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "Excellent choix ! Maintenant, parlons des images lifestyle.",
        content: "Quel type d'ambiance ou de personnes aimeriez-vous voir dans les images lifestyle ?\n\nDonnez-moi juste une description approximative et je génèrerai quelque chose d'incroyable pour vous ! Pensez à l'ambiance, au cadre, ou au type de personne qui représenterait le mieux votre produit.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "Parfait ! Avez-vous besoin d'inclure des clauses de non-responsabilité dans le contenu promotionnel ?",
        content: "Si oui, veuillez fournir le texte exact que vous aimeriez inclure.\n\nSinon, tapez simplement 'Aucune' et nous passerons à l'étape suivante.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "Presque fini ! Dernière question.",
        content: "Où ce contenu promotionnel sera-t-il publié ? Veuillez sélectionner tous les canaux qui s'appliquent :",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "Parfait ! Laissez-moi vous montrer tout ce que vous avez fourni.",
        content: "Veuillez examiner tous les détails ci-dessous et confirmer quand vous êtes prêt à procéder :",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continuer",
      confirmProceed: "Confirmer et Procéder",
      enterYourId: "Entrez votre ID",
      typeResponse: "Tapez votre réponse ici...",
      confirmed: "Confirmé ! Veuillez procéder à la création du contenu promotionnel.",
      successMessage: "Excellent ! J'ai reçu tous vos détails et les ai envoyés à notre système de création de contenu. Vous recevrez les livrables finaux à votre adresse email fournie. Je reviens vers vous bientôt ! 🎉"
    }
  },
  de: {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    questions: [
      {
        id: 1,
        reaction: "Hallo! Ich bin Yumi, Ihre Designerin für Werbeinhalte. 🎨",
        content: "Ich freue mich darauf, Ihnen bei der Erstellung fantastischer Werbeinhalte zu helfen!\n\nLassen Sie uns mit den Grundlagen beginnen - könnten Sie mir bitte Ihre EP ID geben? Das wird die E-Mail-Adresse sein, an die Sie die finalen Ergebnisse erhalten.",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "Perfekt! Erzählen Sie mir nun von dieser Werbeaktion.",
        content: "Ich würde Ihnen gerne dabei helfen, den perfekten Text zu erstellen! Bitte teilen Sie mit:\n\n• Kurze Details zur Werbeaktion\n• Spezifische Rabattsätze und Produkte, die Sie hervorheben möchten\n• Jeden Text, den Sie bereits im Kopf haben\n\nJe mehr Details Sie mir geben, desto besser kann ich das Texten an Ihre Vision anpassen!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "Großartig! Wir sind fast da.",
        content: "Jetzt brauche ich die PDP-URL des Produkts, das Sie hervorheben möchten. Bitte kopieren Sie die Produktseiten-URL hier hinein.\n\n(Derzeit können wir ein Produkt pro Werbeinhalt präsentieren)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "Ausgezeichnete Wahl! Sprechen wir nun über Lifestyle-Bilder.",
        content: "Welche Art von Atmosphäre oder Menschen möchten Sie in den Lifestyle-Bildern sehen?\n\nGeben Sie mir einfach eine grobe Beschreibung und ich erstelle etwas Fantastisches für Sie! Denken Sie an die Stimmung, das Setting oder den Personentyp, der Ihr Produkt am besten repräsentieren würde.",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "Perfekt! Müssen Haftungsausschlüsse in den Werbeinhalt aufgenommen werden?",
        content: "Falls ja, geben Sie bitte den genauen Text an, den Sie einschließen möchten.\n\nFalls nicht, tippen Sie einfach 'Keine' und wir gehen zum nächsten Schritt über.",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "Fast fertig! Letzte Frage.",
        content: "Wo wird dieser Werbeinhalt veröffentlicht? Bitte wählen Sie alle zutreffenden Kanäle aus:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "Perfekt! Lassen Sie mich Ihnen alles zeigen, was Sie bereitgestellt haben.",
        content: "Bitte überprüfen Sie alle Details unten und bestätigen Sie, wenn Sie bereit sind fortzufahren:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Weiter",
      confirmProceed: "Bestätigen und Fortfahren",
      enterYourId: "Geben Sie Ihre ID ein",
      typeResponse: "Tippen Sie Ihre Antwort hier...",
      confirmed: "Bestätigt! Bitte fahren Sie mit der Erstellung des Werbeinhalts fort.",
      successMessage: "Ausgezeichnet! Ich habe alle Ihre Details erhalten und an unser Content-Erstellungssystem gesendet. Sie erhalten die finalen Ergebnisse an Ihre angegebene E-Mail-Adresse. Ich melde mich bald bei Ihnen! 🎉"
    }
  },
  th: {
    code: "th",
    name: "ไทย",
    flag: "🇹🇭",
    questions: [
      {
        id: 1,
        reaction: "สวัสดีค่ะ! ฉันชื่อยูมิ เป็นนักออกแบบเนื้อหาโปรโมชั่นของคุณ 🎨",
        content: "ฉันตื่นเต้นมากที่จะช่วยคุณสร้างเนื้อหาโปรโมชั่นที่น่าทึ่ง!\n\nมาเริ่มด้วยข้อมูลพื้นฐานกันก่อน - คุณช่วยให้ EP ID ของคุณได้ไหมคะ? นี่จะเป็นที่อยู่อีเมลที่คุณจะได้รับผลงานสุดท้าย",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "เยี่ยมเลย! ตอนนี้มาเล่าให้ฟังเกี่ยวกับโปรโมชั่นนี้หน่อย",
        content: "ฉันอยากช่วยคุณสร้างข้อความที่สมบูรณ์แบบ! กรุณาแบ่งปัน:\n\n• รายละเอียดโปรโมชั่นโดยย่อ\n• อัตราส่วนลดเฉพาะและผลิตภัณฑ์ที่คุณต้องการเน้น\n• ข้อความใดๆ ที่คุณคิดไว้แล้ว\n\nยิ่งคุณให้รายละเอียดมากเท่าไหร่ ฉันก็ยิ่งสามารถปรับแต่งการเขียนให้ตรงกับวิสัยทัศน์ของคุณได้อย่างสมบูรณ์แบบ!",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "เจ๋งมาก! เกือบถึงแล้ว",
        content: "ตอนนี้ฉันต้องการ PDP URL ของผลิตภัณฑ์ที่คุณต้องการเน้น กรุณาคัดลอกและวาง URL หน้าผลิตภัณฑ์ที่นี่\n\n(ปัจจุบันเราสามารถแสดงผลิตภัณฑ์หนึ่งรายการต่อเนื้อหาโปรโมชั่น)",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "เลือกได้ดีมาก! ตอนนี้มาพูดถึงภาพไลฟ์สไตล์กัน",
        content: "คุณอยากเห็นบรรยากาศแบบไหนหรือคนแบบไหนในภาพไลฟ์สไตล์?\n\nแค่บอกฉันคร่าวๆ แล้วฉันจะสร้างสิ่งที่น่าทึ่งให้คุณ! ลองคิดถึงอารมณ์ ฉากหลัง หรือประเภทของคนที่จะแสดงผลิตภัณฑ์ของคุณได้ดีที่สุด",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "สมบูรณ์แบบ! คุณต้องการรวมข้อจำกัดความรับผิดชอบในเนื้อหาโปรโมชั่นหรือไม่?",
        content: "หากต้องการ กรุณาให้ข้อความที่แน่นอนที่คุณต้องการใส่\n\nหากไม่ต้องการ ก็แค่พิมพ์ 'ไม่มี' แล้วเราจะไปขั้นตอนต่อไป",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "เกือบเสร็จแล้ว! คำถามสุดท้าย",
        content: "เนื้อหาโปรโมชั่นนี้จะถูกเผยแพร่ที่ไหน? กรุณาเลือกช่องทางทั้งหมดที่เกี่ยวข้อง:",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "สมบูรณ์แบบ! ให้ฉันแสดงทุกอย่างที่คุณให้มา",
        content: "กรุณาตรวจสอบรายละเอียดทั้งหมดด้านล่างและยืนยันเมื่อคุณพร้อมที่จะดำเนินการ:",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "ดำเนินการต่อ",
      confirmProceed: "ยืนยันและดำเนินการ",
      enterYourId: "ใส่ ID ของคุณ",
      typeResponse: "พิมพ์คำตอบของคุณที่นี่...",
      confirmed: "ยืนยันแล้ว! กรุณาดำเนินการสร้างเนื้อหาโปรโมชั่น",
      successMessage: "ยอดเยี่ยม! ฉันได้รับรายละเอียดทั้งหมดของคุณแล้วและส่งไปยังระบบสร้างเนื้อหาของเรา คุณจะได้รับผลงานสุดท้ายที่ที่อยู่อีเมลที่คุณให้มา จะกลับมาหาคุณเร็วๆ นี้! 🎉"
    }
  },
  ja: {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
    questions: [
      {
        id: 1,
        reaction: "こんにちは！私はプロモーションコンテンツデザイナーのユミです。🎨",
        content: "素晴らしいプロモーションコンテンツを作るお手伝いができて嬉しいです！\n\n基本情報から始めましょう。EP IDを教えていただけますか？最終成果物をお受け取りいただくメールアドレスです。",
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        reaction: "完璧です！このプロモーションについて教えてください。",
        content: "完璧なコピーを作成するお手伝いをさせてください！以下を共有してください：\n\n• プロモーションの簡単な詳細\n• 具体的な割引率とハイライトしたい製品\n• すでに考えているコピーがあれば\n\n詳細を教えていただくほど、あなたのビジョンに完璧に合うコピーライティングを作成できます！",
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        reaction: "素晴らしい！もうすぐです。",
        content: "フィーチャーしたい製品のPDP URLが必要です。製品ページのURLをここにコピー＆ペーストしてください。\n\n（現在、プロモーションコンテンツ1つにつき1つの製品を紹介できます）",
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        reaction: "素晴らしい選択！ライフスタイル画像について話しましょう。",
        content: "ライフスタイル画像でどのような雰囲気や人々を見たいですか？\n\n大まかな説明をしていただければ、素晴らしいものを生成します！製品を最もよく表現する雰囲気、設定、または人のタイプを考えてみてください。",
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        reaction: "完璧です！プロモーションコンテンツに免責事項を含める必要がありますか？",
        content: "ある場合は、含めたい正確なテキストを提供してください。\n\nない場合は、「なし」と入力して次のステップに進みます。",
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        reaction: "もうすぐ完了！最後の質問です。",
        content: "このプロモーションコンテンツはどこで公開されますか？該当するすべてのチャンネルを選択してください：",
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        reaction: "完璧です！提供していただいたすべてを表示します。",
        content: "以下のすべての詳細を確認し、進む準備ができたら確認してください：",
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "続行",
      confirmProceed: "確認して進む",
      enterYourId: "IDを入力してください",
      typeResponse: "ここに回答を入力してください...",
      confirmed: "確認されました！プロモーションコンテンツの作成を進めてください。",
      successMessage: "素晴らしい！すべての詳細を受け取り、コンテンツ作成システムに送信しました。提供されたメールアドレスで最終成果物をお受け取りいただけます。すぐにご連絡いたします！🎉"
    }
  }
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>("en");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState<FormData>({
    epId: "",
    promotionInfo: "",
    productUrl: "",
    lifestyleImage: "",
    disclaimer: "",
    channels: []
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isYumiThinking, setIsYumiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with first question reaction and content only on first load
    if (messages.length === 0) {
      const firstQuestion = languages[currentLanguage].questions[0];
      sendReactionAndContent(firstQuestion.reaction, firstQuestion.content);
    }
  }, [currentLanguage]);

  const sendReactionAndContent = (reaction: string, content: string) => {
    // Send reaction first
    setMessages(prev => [...prev, {
      id: `yumi-${Date.now()}-reaction`,
      sender: "yumi",
      content: reaction,
      timestamp: new Date(),
      type: "question"
    }]);

    // Send content after 1.5 seconds
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `yumi-${Date.now()}-content`,
        sender: "yumi",
        content: content,
        timestamp: new Date(),
        type: "question"
      }]);
    }, 1500);
  };

  const getCurrentQuestion = () => {
    return languages[currentLanguage].questions[currentQuestionIndex];
  };

  const addThinkingMessage = () => {
    const thinkingId = `thinking-${Date.now()}`;
    setIsYumiThinking(true);
    
    setMessages(prev => [...prev, {
      id: thinkingId,
      sender: "yumi",
      content: "...",
      timestamp: new Date(),
      type: "question"
    }]);

    // Replace thinking message with reaction and content after 1.5 seconds
    setTimeout(() => {
      setIsYumiThinking(false);
      if (currentQuestionIndex < languages[currentLanguage].questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = languages[currentLanguage].questions[nextIndex];
        
        // Remove thinking message
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
        
        // Send reaction and content
        sendReactionAndContent(nextQuestion.reaction, nextQuestion.content);
      }
    }, 1500);
  };

  const handleInputSubmit = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (!inputValue.trim() && currentQuestion.inputType !== "checkbox") return;

    // For the first question (EP ID), automatically append @lge.com if not already present
    let finalValue = inputValue;
    if (currentQuestion.inputType === "email" && currentQuestionIndex === 0) {
      if (!inputValue.includes("@")) {
        finalValue = inputValue + "@lge.com";
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: finalValue,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, userMessage]);

    if (currentQuestion.field) {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.field]: finalValue
      }));
    }

    setInputValue("");
    
    setTimeout(() => {
      addThinkingMessage();
    }, 300);
  };

  const handleChannelSubmit = () => {
    const channelsText = formData.channels.length > 0 
      ? formData.channels.join(", ") 
      : "None selected";

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: channelsText,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      addThinkingMessage();
    }, 300);
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleConfirmation = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    const confirmationMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: languages[currentLanguage].ui.confirmed,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, confirmationMessage]);

    // Submit to webhook
    try {
      const response = await fetch('https://hook.eu2.make.com/fudgr1kczns9j3bj9ckzp6b4fxpg2jx8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EPID: formData.epId,
          PromotionInfo: formData.promotionInfo,
          ProductUrl: formData.productUrl,
          LifestyleImage: formData.lifestyleImage,
          Disclaimer: formData.disclaimer,
          Channels: formData.channels
        }),
      });

      if (response.ok) {
        setSubmissionStatus('success');
        toast({
          title: "Success",
          description: "Your request has been submitted successfully!",
        });

        setTimeout(() => {
          const successMessage: Message = {
            id: `yumi-${Date.now()}`,
            sender: "yumi",
            content: languages[currentLanguage].ui.successMessage,
            timestamp: new Date(),
            type: "question"
          };

          setMessages(prev => [...prev, successMessage]);
          setIsCompleted(true);
        }, 1500);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentInputField = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (currentQuestion.inputType === "confirmation") {
      return (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900">Review Your Information:</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">EP ID:</span> {formData.epId}</p>
              <p><span className="font-medium">Promotion Info:</span> {formData.promotionInfo}</p>
              <p><span className="font-medium">Product URL:</span> {formData.productUrl}</p>
              <p><span className="font-medium">Lifestyle Image:</span> {formData.lifestyleImage}</p>
              <p><span className="font-medium">Disclaimer:</span> {formData.disclaimer}</p>
              <p><span className="font-medium">Channels:</span> {formData.channels.join(", ") || "None"}</p>
            </div>
          </div>
          <Button 
            onClick={handleConfirmation} 
            className="w-full flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : submissionStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Submitted Successfully!
              </>
            ) : submissionStatus === 'error' ? (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                Try Again
              </>
            ) : (
              languages[currentLanguage].ui.confirmProceed
            )}
          </Button>
        </div>
      );
    }

    if (currentQuestion.inputType === "checkbox") {
      return (
        <div className="space-y-4">
          {currentQuestion.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={formData.channels.includes(option)}
                onCheckedChange={(checked) => handleChannelChange(option, checked as boolean)}
              />
              <label htmlFor={option} className="text-sm font-medium">{option}</label>
            </div>
          ))}
          <Button 
            onClick={handleChannelSubmit}
            className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white"
            disabled={formData.channels.length === 0}
          >
            {languages[currentLanguage].ui.continue}
          </Button>
        </div>
      );
    }

    if (currentQuestion.inputType === "textarea") {
      return (
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={languages[currentLanguage].ui.typeResponse}
            rows={3}
            className="flex-1 border-gray-200"
          />
          <Button 
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
            size="icon"
            className="self-end bg-orange-400 hover:bg-orange-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-center bg-gray-100 rounded-lg px-3 py-2">
        <Input
          type={currentQuestion.inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentQuestion.inputType === "email" ? languages[currentLanguage].ui.enterYourId : languages[currentLanguage].ui.typeResponse}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
        />
        {currentQuestionIndex === 0 && <span className="text-gray-600 text-sm">@lge.com</span>}
        <Button 
          onClick={handleInputSubmit}
          disabled={!inputValue.trim()}
          size="icon"
          className="bg-orange-400 hover:bg-orange-500"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Show completion screen when process is done
  if (isCompleted) {
    return (
      <div className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" 
           style={{
             backgroundImage: `url('/lovable-uploads/bc537bc9-b912-4359-a294-eb543db318e3.png')`
           }}>
        <div className="w-full max-w-lg mx-4 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 text-center">
            {/* Completion Video */}
            <div className="mb-6">
              <video 
                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/yumi-completion-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Yumi's Message */}
            <div className="mb-8">
              <p className="text-white text-lg font-medium leading-relaxed">
                I'll focus on my work now,<br />
                you can close this screen
              </p>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={() => navigate("/")}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: `url('/lovable-uploads/bc537bc9-b912-4359-a294-eb543db318e3.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Back to Home button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Main chat container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Chat header with Yumi's profile */}
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src="/lovable-uploads/1d0546ae-2d59-40cf-a231-60343eecc72a.png" 
                    alt="Yumi Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Yumi</h2>
                  <p className="text-gray-600">Promotional Content Designer</p>
                </div>
              </div>
              
              {/* Language selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{languages[currentLanguage].flag}</span>
                    <span className="hidden sm:inline">{languages[currentLanguage].name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(languages).map(([code, lang]) => (
                    <DropdownMenuItem
                      key={code}
                      onClick={() => {
                        const newLanguage = code as keyof typeof languages;
                        if (newLanguage !== currentLanguage) {
                          // Translate existing messages to new language
                          const translatedMessages = messages.map(message => {
                            if (message.sender === 'yumi') {
                              // Find corresponding question in new language
                              const messageIndex = messages.filter(m => m.sender === 'yumi' && m.id <= message.id).length - 1;
                              const questionIndex = Math.floor(messageIndex / 2); // Each question has reaction + content
                              const isReaction = messageIndex % 2 === 0;
                              
                              if (questionIndex < languages[newLanguage].questions.length) {
                                const newQuestion = languages[newLanguage].questions[questionIndex];
                                return {
                                  ...message,
                                  content: isReaction ? newQuestion.reaction : newQuestion.content
                                };
                              }
                            }
                            return message; // Keep user messages as is
                          });
                          
                          setMessages(translatedMessages);
                          setCurrentLanguage(newLanguage);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "text-white rounded-br-md"
                      : "bg-white text-gray-900 shadow-sm rounded-bl-md border border-gray-100"
                  }`}
                  style={message.sender === "user" ? { backgroundColor: "#5D4E49" } : {}}
                >
                   <p className="text-sm whitespace-pre-wrap">
                     {message.content === "..." ? (
                       <span className="inline-flex">
                         <span className="animate-pulse mr-1">.</span>
                         <span className="animate-pulse delay-150 mr-1">.</span>
                         <span className="animate-pulse delay-300">.</span>
                       </span>
                     ) : (
                       message.content
                     )}
                   </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === "user" && (
                      <Edit3 className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {!isCompleted && (
            <div className="p-6 bg-white border-t border-gray-100">
              {getCurrentInputField()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;