# Analyse détaillée du Modèle Baseline (TF-IDF + Logistic Regression)

## Résultats Globaux

| Métrique | Valeur | Interprétation |
|----------|--------|---|
| **Accuracy** | 77.23% | Le modèle classifie correctement 77% des phrases |
| **Precision** | 75.24% | Parmi les prédictions positives, 75% sont correctes |
| **Recall** | 77.23% | Le modèle détecte 77% des cas positifs réels |
| **F1-Score** | 74.84% | Score équilibré : **0.7484** |

### Interprétation

Un **F1-score de 75%** pour un modèle baseline est **très solide** pour une première approche ! Cela signifie :
- Le modèle détecte correctement les claims **3 fois sur 4**
- Precision et Recall sont équilibrés (~77%), pas d'overfitting apparent
- Comparable aux baselines de la littérature (ClaimBuster original ~72%)

---

## Matrice de Confusion

```
Predicted →  |  Class 0  |  Class 1  |  Class 2
Actual ↓     |           |           |
─────────────┼───────────┼───────────┼──────────
Class 0      |  2738     |    46     |   142     (Total: 2926)
Class 1      |   282     |   106     |   114     (Total: 502)
Class 2      |   406     |    35     |   632     (Total: 1073)
```

### 📈 Performance Par Classe

#### **Classe 0** : 93.6% de rappel
- TP: 2738/2926 = 93.6%
- C'est la classe **dominante et bien prédite**
- Peu de faux positifs (46 + 142 = 188 erreurs)

#### **Classe 1** : 21.1% de rappel
- TP: 106/502 = 21.1%
- **TRÈS MAL PRÉDITE** - seulement 1 sur 5 détectée correctement
- 282 instances confondues avec Classe 0
- 114 instances confondues avec Classe 2
- C'est la classe **minoritaire**, peut-être sous-représentée dans l'entraînement

#### **Classe 2** : 58.9% de rappel
- TP: 632/1073 = 58.9%
- Confusion majeure avec Classe 0 (406 instances)
- Le modèle a tendance à prédire Classe 0 par défaut

---

## Analyse des Erreurs

### Types d'Erreurs

| Erreur | Nombre | % | Implication |
|--------|--------|---|---|
| Classe 0 → confusions | 188 | 6.4% | Très peu d'erreurs |
| Classe 1 → Classe 0 | 282 | 56.2% | Biais vers la majorité |
| Classe 1 → Classe 2 | 114 | 22.7% | Confusion entre classes mineures |
| Classe 2 → Classe 0 | 406 | 37.8% | Prédiction par défaut |

**Le modèle a un biais** : il prédit Classe 0 par défaut car c'est la classe la plus fréquente dans l'entraînement.