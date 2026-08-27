import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import type { CardCarouselItem } from '../../components/custom/CardCarousel';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import { Button } from '../../components/ui/button';
import { s } from '../../utils/style-helpers';
import StepIndicator from '../../components/custom/creation/StepIndicator';
import NameStep from '../../components/custom/creation/NameStep';
import ClassStep from '../../components/custom/creation/ClassStep';
import LevelStep from '../../components/custom/creation/LevelStep';
import SubclassStep from '../../components/custom/creation/SubclassStep';
import SkillsStep from '../../components/custom/creation/SkillsStep';
import RaceStep from '../../components/custom/creation/RaceStep';
import BackgroundStep from '../../components/custom/creation/BackgroundStep';
import AbilitiesStep from '../../components/custom/creation/AbilitiesStep';
import FeatStep from '../../components/custom/creation/FeatStep';
import HpStep from '../../components/custom/creation/HpStep';
import SummaryStep from '../../components/custom/creation/SummaryStep';
import ValuePickerModal from '../../components/custom/creation/ValuePickerModal';
import CardDetailModal from '../../components/custom/creation/CardDetailModal';
import { useCharacterWizard } from '../../components/custom/creation/useCharacterWizard';
import { getProficiencyBonus } from '../../lib/rules/progression';

/**
 * Schermata del wizard di creazione personaggio.
 * Renderer sottile: tutta la logica (stato, derivati, validazione, creazione)
 * vive in `useCharacterWizard`; ogni passo è un componente presentational.
 */
export default function CharacterCreateScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const w = useCharacterWizard();
  // P1 — dettaglio completo della card del carousel (pulsante info "(i)")
  const [detailItem, setDetailItem] = useState<CardCarouselItem | null>(null);

  return (
    // Il padding bottom di default (safePadding) riserva spazio per la floating tab
    // bar; su questa schermata pushata non c'è, quindi lo riduciamo a solo safe area.
    <Screen scrollable={false} center={false} style={{ paddingBottom: insets.bottom + t.spacing[3] }}>
      <ScreenHeader title="Nuovo Personaggio" icon="person-add-outline" />
      <BackButton onPress={() => navigation.goBack()} />

      <StepIndicator steps={w.activeSteps} current={w.step} onSelect={w.setStep} isValid={w.stepValid} />

      <View style={s.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: t.spacing[12] }}
        >
          {w.step === 'name' && <NameStep value={w.name} onChange={w.setName} />}

          {w.step === 'class' && (
            <ClassStep
              items={w.classes}
              selected={w.selectedClass}
              onSelect={w.setSelectedClass}
              onShowDetails={setDetailItem}
              classList={w.classList}
              activeIndex={w.activeClassIndex}
              onSelectActive={w.setActiveClassIndex}
              onAddClass={w.addClass}
              onRemoveClass={w.removeClass}
              canAddClass={w.canAddClass}
              totalLevel={w.totalLevel}
            />
          )}

          {w.step === 'skills' && (
            <SkillsStep
              classNameLabel={w.classLabel}
              skillOptions={w.classSkillOptions}
              skillCount={w.skillCount}
              selectedSkills={w.classSkills}
              onToggleSkill={w.toggleSkill}
              classList={w.classList}
              activeIndex={w.activeClassIndex}
              onSelectActive={w.setActiveClassIndex}
            />
          )}

          {w.step === 'level' && (
            <LevelStep
              level={w.level}
              onLevelChange={w.setLevel}
              hitDie={w.hitDie}
              levelFeatures={w.levelFeatures}
              classNameLabel={w.classLabel}
              totalLevel={w.totalLevel}
              maxLevel={20 - (w.totalLevel - w.level)}
              classList={w.classList}
              activeIndex={w.activeClassIndex}
              onSelectActive={w.setActiveClassIndex}
            />
          )}

          {w.step === 'subclass' && w.subclassUnlocked && (
            <SubclassStep
              subclassLabel={w.subclassLabel}
              firstSubclassLevel={w.subclassLevels[0]}
              subclassId={w.subclassId}
              onSubclassChange={w.setSubclassId}
              onShowDetails={setDetailItem}
              subclasses={w.subclasses}
              classNameLabel={w.classLabel}
              classList={w.classList}
              activeIndex={w.activeClassIndex}
              onSelectActive={w.setActiveClassIndex}
            />
          )}

          {w.step === 'race' && (
            <RaceStep
              raceId={w.raceId}
              onRaceChange={w.setRaceId}
              lineageId={w.lineageId}
              onLineageChange={w.setLineageId}
              onShowDetails={setDetailItem}
              raceSkillOptions={w.raceSkillOptions}
              raceSkills={w.raceSkills}
              raceSkillCount={w.raceSkillCount}
              toggleRaceSkill={w.toggleRaceSkill}
            />
          )}

          {w.step === 'background' && (
            <BackgroundStep
              backgroundId={w.backgroundId}
              onSelect={w.setBackgroundId}
              onShowDetails={setDetailItem}
              bgToolOptions={w.bgToolOptions}
              bgToolChoices={w.bgToolChoices}
              bgToolCount={w.bgToolCount}
              toggleBgTool={w.toggleBgTool}
              featChoice={w.featChoice}
            />
          )}

          {w.step === 'abilities' && (
            <AbilitiesStep
              assigned={w.assigned}
              onEditAbility={w.openAbilityPicker}
              onClear={w.clearAbility}
              abilityMethod={w.abilityMethod}
              onMethodChange={w.setAbilityMethod}
              onSuggest={w.suggestScores}
              onAdjust={w.adjustAbility}
              pointsLeft={w.pointsLeft}
              showBoosts={w.showBoosts}
              allowedAbilities={w.allowedAbilities}
              plusTwoPlusOne={w.plusTwoPlusOne}
              picks={w.picks}
              onTogglePick={w.togglePick}
              finalResult={w.finalResult}
              multiclassPrereqMissing={w.multiclassPrereqMissing}
            />
          )}

          {w.step === 'feat' && (
            <FeatStep
              level={w.level}
              hasFightingStyle={w.hasFightingStyle}
              fightingStyleOptions={w.fightingStyleOptions}
              fightingStyleId={w.fightingStyleId}
              onSelectFightingStyle={w.selectFightingStyle}
              asiKeys={w.asiKeys}
              asiAssignments={w.asiAssignments}
              onAsiModeChange={w.setAsiMode}
              onAsiToggleAbility={w.toggleAsiAbility}
              featAtAsiLevel={w.featAtAsiLevel}
              onSetAsiLevelFeat={w.setAsiLevelFeat}
              generalFeatOptions={w.generalFeatOptions}
              featAsiPicks={w.featAsiPicks}
              onToggleFeatAsi={w.toggleFeatAsi}
              featChoices={w.featChoices}
              onFeatChoiceChange={w.setFeatChoice}
              hasRaceFeat={w.hasRaceFeat}
              raceFeatOptions={w.raceFeatOptions}
              raceFeatId={w.raceFeatId}
              onRaceFeatSelect={w.selectRaceFeat}
              knownSkills={[
                ...(w.classSkills ?? []),
                ...(w.raceSkills ?? []),
                ...(w.featChoice.skillSelected ?? []),
              ]}
              knownExpertise={[]}
              proficiencyBonus={getProficiencyBonus(w.totalLevel)}
              epicBoonUnlocked={w.epicBoonUnlocked}
              epicBoonOptions={w.epicBoonOptions}
              epicBoonId={w.epicBoonId}
              onSelectEpicBoon={w.selectEpicBoon}
              validationError={w.featError}
              finalScores={w.finalScores}
            />
          )}

          {w.step === 'hp' && (
            <HpStep
              hitDie={w.primaryHitDie}
              level={w.totalLevel}
              conMod={w.conMod}
              averagePerLevel={w.averagePerLevel}
              hpRoll={w.hpRoll}
              onRoll={w.setHpRoll}
              onTakeMax={w.takeMaxHp}
            />
          )}

          {w.step === 'summary' && (
            <SummaryStep
              name={w.name}
              classList={w.classList}
              totalLevel={w.totalLevel}
              raceId={w.raceId}
              lineageId={w.lineageId}
              backgroundId={w.backgroundId}
              abilityMethod={w.abilityMethod}
              finalScores={w.finalScores}
              generalFeatIds={w.generalFeatIds}
              fightingStyleId={w.fightingStyleId}
              epicBoonId={w.epicBoonId}
              hitDie={w.primaryHitDie}
              conMod={w.conMod}
              averagePerLevel={w.averagePerLevel}
              hpRoll={w.hpRoll}
            />
          )}

          {w.error && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.danger, marginTop: t.spacing[3] }}>{w.error}</Text>
          )}
        </ScrollView>
      </View>

      {/* Motivo per cui non si può avanzare (niente pulsanti muti) */}
      {(!w.canGoNext || (w.isLastStep && !w.canCreate)) && w.stepInvalidReason(w.step) != null && (
        <Text
          style={{
            fontSize: t.typography.xs,
            color: t.colors.danger,
            paddingHorizontal: t.spacing[3],
            paddingBottom: t.spacing[1],
          }}
        >
          {w.stepInvalidReason(w.step)}
        </Text>
      )}

      {/* Barra di navigazione in fondo */}
      <View style={[s.row, s.gap(t.spacing[3]), s.py(t.spacing[3]), {
        borderTopWidth: 1,
        borderTopColor: t.colors.border,
        backgroundColor: t.colors.background,
      }]}>
        {w.stepIndex > 0 ? (
          <Button variant="outline" onPress={w.goPrev} style={{ flex: 1 }}>Indietro</Button>
        ) : (
          // Sul primo passo non c'è "Indietro": uno spacer mantiene "Avanti"
          // in basso a destra con la stessa dimensione delle altre pagine.
          <View style={{ flex: 1 }} />
        )}
        {!w.isLastStep ? (
          <Button onPress={w.goNext} disabled={!w.canGoNext} style={{ flex: 1 }}>Avanti</Button>
        ) : (
          <Button
            onPress={w.handleCreate}
            disabled={!w.canCreate}
            fullWidth
          >
            Crea Personaggio
          </Button>
        )}
      </View>

      {/* Modale scelta valore per un'abilità */}
      <ValuePickerModal
        ability={w.editingAbility}
        options={w.pickerOptions}
        method={w.abilityMethod}
        pointsLeft={w.pointsLeft}
        onSelect={(value) => { if (w.editingAbility) w.assignToAbility(w.editingAbility, value); }}
        onClose={w.closeAbilityPicker}
      />

      {/* Modale dettaglio completo della card del carousel (P1) */}
      <CardDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </Screen>
  );
}

