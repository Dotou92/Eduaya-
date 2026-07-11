// api/_offers.js
// Catalogue des offres — SEULE source de vérité pour les prix.
// Le navigateur n'envoie jamais amount/credits/duration : uniquement un offerId.

export const OFFERS = Object.freeze({
  credits_5: {
    type: 'credits',
    amount: 100,
    currency: 'XOF',
    credits: 5,
    label: '5 conversations',
    active: true
  },
  credits_12: {
    type: 'credits',
    amount: 200,
    currency: 'XOF',
    credits: 12,
    label: '12 conversations',
    active: true
  },
  premium_monthly: {
    type: 'premium',
    amount: 5000,
    currency: 'XOF',
    durationDays: 30,
    label: 'Premium illimité, 1 mois',
    active: true
  }
});

export function getOffer(offerId) {
  const offer = OFFERS[offerId];
  if (!offer || !offer.active) return null;
  return offer;
      }
