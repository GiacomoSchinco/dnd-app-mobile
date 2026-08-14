import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
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
import ValuePickerModal from '../../components/custom/creation/ValuePickerModal';
import { useCharacterWizard } from '../../components/custom/creation/useCharacterWizard';

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
            <ClassStep items={w.classes} selected={w.selectedClass} onSelect={w.setSelectedClass} />
          )}

          {w.step === 'skills' && (
            <SkillsStep
              classNameLabel={w.classLabel}
              skillOptions={w.classSkillOptions}
              skillCount={w.skillCount}
              selectedSkills={w.classSkills}
              onToggleSkill={w.toggleSkill}
            />
          )}

          {w.step === 'level' && (
            <LevelStep
              level={w.level}
              onLevelChange={w.setLevel}
              hitDie={w.hitDie}
              levelFeatures={w.levelFeatures}
            />
          )}

          {w.step === 'subclass' && w.subclassUnlocked && (
            <SubclassStep
              subclassLabel={w.subclassLabel}
              firstSubclassLevel={w.subclassLevels[0]}
              subclassId={w.subclassId}
              onSubclassChange={w.setSubclassId}
              subclasses={w.subclasses}
            />
          )}

          {w.step === 'race' && (
            <RaceStep
              raceId={w.raceId}
              onRaceChange={w.setRaceId}
              lineageId={w.lineageId}
              onLineageChange={w.setLineageId}
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
              showBoosts={w.showBoosts}
              allowedAbilities={w.allowedAbilities}
              plusTwoPlusOne={w.plusTwoPlusOne}
              picks={w.picks}
              onTogglePick={w.togglePick}
              finalResult={w.finalResult}
            />
          )}

          {w.step === 'feat' && (
            <FeatStep
              level={w.level}
              hasFightingStyle={w.hasFightingStyle}
              fightingStyleOptions={w.fightingStyleOptions}
              fightingStyleId={w.fightingStyleId}
              onSelectFightingStyle={w.selectFightingStyle}
              asiLevels={w.asiLevelsApplied}
              asiAssignments={w.asiAssignments}
              onAsiModeChange={w.setAsiMode}
              onAsiToggleAbility={w.toggleAsiAbility}
              featAtAsiLevel={w.featAtAsiLevel}
              onSetAsiLevelFeat={w.setAsiLevelFeat}
              generalFeatOptions={w.generalFeatOptions}
              featAsiPicks={w.featAsiPicks}
              onToggleFeatAsi={w.toggleFeatAsi}
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
              hitDie={w.hitDie}
              level={w.level}
              conMod={w.conMod}
              averagePerLevel={w.averagePerLevel}
              hpRoll={w.hpRoll}
              onRoll={w.setHpRoll}
              onTakeMax={w.takeMaxHp}
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
        pool={w.pool}
        onSelect={(value) => { if (w.editingAbility) w.assignToAbility(w.editingAbility, value); }}
        onClose={w.closeAbilityPicker}
      />
    </Screen>
  );
}

