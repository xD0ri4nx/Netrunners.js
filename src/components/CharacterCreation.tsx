import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMissionStore } from '../store/missionStore';
import { useRoutingStore } from '../store/routingStore';
import { useTerminalStore } from '../store/terminalStore';
import type { CharacterStats, Program } from '../types/game.types';
import { LDL_DATABASE } from '../data/ldlDatabase';

const STAT_NAMES: Array<{ key: keyof CharacterStats; name: string; desc: string }> = [
  { key: 'int', name: 'INT', desc: 'Intelligence' },
  { key: 'ref', name: 'REF', desc: 'Reflexes' },
  { key: 'tech', name: 'TECH', desc: 'Technical Ability' },
  { key: 'cool', name: 'COOL', desc: 'Cool/Willpower' },
  { key: 'attr', name: 'ATTR', desc: 'Attractiveness' },
  { key: 'luck', name: 'LUCK', desc: 'Luck' },
  { key: 'ma', name: 'MA', desc: 'Movement' },
  { key: 'body', name: 'BODY', desc: 'Body Type' },
  { key: 'emp', name: 'EMP', desc: 'Empathy' }
];

const SKILL_NAMES: Array<{ key: string; name: string }> = [
  { key: 'interface', name: 'Interface' },
  { key: 'awareness', name: 'Awareness' },
  { key: 'basicTech', name: 'Basic Tech' },
  { key: 'education', name: 'Education' },
  { key: 'systemKnowledge', name: 'Sys. Knowledge' },
  { key: 'cyberTech', name: 'CyberTech' },
  { key: 'cyberdeckDesign', name: 'Deck Design' },
  { key: 'programming', name: 'Programming' },
  { key: 'composition', name: 'Composition' },
  { key: 'electronics', name: 'Electronics' }
];

const TIERS = [
  { value: 1, name: 'Street Rat', points: 50, funds: 500, desc: '500 cr - Extreme difficulty' },
  { value: 2, name: 'Scrapper', points: 60, funds: 1500, desc: '1500 cr - Hard difficulty' },
  { value: 3, name: 'Edgerunner', points: 70, funds: 3000, desc: '3000 cr - Normal difficulty' },
  { value: 4, name: 'Corporate', points: 70, funds: 7000, desc: '7000 cr - Easy' },
  { value: 5, name: 'Trust Fund', points: 75, funds: 15000, desc: '15000 cr - Very Easy' }
];

interface TierKit {
  housingType: string;
  housingCost: number;
  isStreet: boolean;
  deckModel: string;
  mu: number;
  speed: number;
  walls: number;
  bonusPrograms: Program[];
}

const SHIELD: Program = { id: 'prog_shield', name: 'Shield', type: 'defense', strength: 4, difficulty: 14, muCost: 1, marketValue: 350, isCustom: false };
const ARMOR: Program = { id: 'prog_armor', name: 'Armor', type: 'defense', strength: 5, difficulty: 16, muCost: 2, marketValue: 500, isCustom: false };
const INVISIBILITY: Program = { id: 'prog_invisibility', name: 'Invisibility', type: 'stealth', strength: 5, difficulty: 18, muCost: 2, marketValue: 600, isCustom: false };
const BRAINWIPE: Program = { id: 'prog_brainwipe', name: 'Brainwipe', type: 'anti-ice', strength: 5, difficulty: 18, muCost: 2, marketValue: 700, isCustom: false };
const IMP: Program = { id: 'prog_imp', name: 'Imp', type: 'anti-ice', strength: 6, difficulty: 20, muCost: 2, marketValue: 900, isCustom: false };

const TIER_KITS: Record<number, TierKit> = {
  1: { housingType: 'street', housingCost: 0, isStreet: true, deckModel: 'Fuchi Cyber-6', mu: 10, speed: 1, walls: 4, bonusPrograms: [] },
  2: { housingType: 'coffin', housingCost: 150, isStreet: false, deckModel: 'Standard Cybermodem', mu: 10, speed: 1, walls: 3, bonusPrograms: [SHIELD] },
  3: { housingType: 'apartment', housingCost: 200, isStreet: false, deckModel: 'Z-Tech Paraline 5750', mu: 10, speed: 1, walls: 4, bonusPrograms: [ARMOR] },
  4: { housingType: 'apartment', housingCost: 500, isStreet: false, deckModel: 'EBM P.C. 2020', mu: 15, speed: 1, walls: 2, bonusPrograms: [INVISIBILITY, BRAINWIPE] },
  5: { housingType: 'penthouse', housingCost: 1000, isStreet: false, deckModel: 'Raven Microcybernetics', mu: 15, speed: 2, walls: 5, bonusPrograms: [INVISIBILITY, BRAINWIPE, IMP] }
};

export function CharacterCreation({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const [handle, setHandle] = useState('');
  const [selectedTier, setSelectedTier] = useState(3);
  const [pointPool, setPointPool] = useState(70);
  const [skillPoints, setSkillPoints] = useState(40);
  const [stats, setStats] = useState<CharacterStats>({
    int: 6, ref: 5, tech: 5, cool: 5, attr: 5, luck: 5, ma: 5, body: 5, emp: 8
  });
  const [skills, setSkills] = useState<Record<string, number>>({
    interface: 4, awareness: 1, basicTech: 1, education: 1, systemKnowledge: 1,
    cyberTech: 1, cyberdeckDesign: 1, programming: 3, composition: 1, electronics: 1
  });
  const [activeTab, setActiveTab] = useState('stats');
  const [homeLdl, setHomeLdl] = useState('night_city');

  const currentTier = TIERS.find(t => t.value === selectedTier);
  const usedStatPoints = Object.values(stats).reduce((a, b) => a + b, 0);
  const availableStatPoints = pointPool - usedStatPoints;
  const usedSkillPoints = Object.values(skills).reduce((a, b) => a + b, 0);
  const availableSkillPoints = 40 - usedSkillPoints;

  const adjustStat = (statKey: keyof CharacterStats, delta: number): void => {
    const newStats = { ...stats };
    const currentValue = newStats[statKey];
    const newValue = currentValue + delta;
    
    if (delta > 0 && newValue <= 10 && availableStatPoints > 0) {
      newStats[statKey] = newValue;
      setStats(newStats);
    } else if (delta < 0 && newValue >= 2) {
      newStats[statKey] = newValue;
      setStats(newStats);
    }
  };

  const adjustSkill = (skillKey: string, delta: number): void => {
    const newSkills = { ...skills };
    const currentValue = newSkills[skillKey];
    const newValue = currentValue + delta;
    
    if (delta > 0 && newValue <= 10 && availableSkillPoints > 0) {
      newSkills[skillKey] = newValue;
      setSkills(newSkills);
      setSkillPoints(skillPoints - 1);
    } else if (delta < 0 && newValue >= 1) {
      newSkills[skillKey] = newValue;
      setSkills(newSkills);
      setSkillPoints(skillPoints + 1);
    }
  };

  const handleTierChange = (tierValue: number): void => {
    const tier = TIERS.find(t => t.value === tierValue);
    setSelectedTier(tierValue);
    setPointPool(tier?.points ?? 70);
  };

  const handleBegin = (): void => {
    if (!handle.trim()) {
      alert('Please enter a street name (Handle)');
      return;
    }

    const kit = TIER_KITS[selectedTier] ?? TIER_KITS[3];

    const charData = {
      handle: handle.trim(),
      int: stats.int,
      ref: stats.ref,
      tech: stats.tech,
      cool: stats.cool,
      attr: stats.attr,
      luck: stats.luck,
      ma: stats.ma,
      body: stats.body,
      emp: stats.emp,
      skills: {
        interface: skills.interface,
        programming: skills.programming,
        electronics: skills.electronics,
        cryptography: 1,
        librarySearch: 2,
        handgun: 3,
        brawling: 2,
        awareness: skills.awareness,
        basicTech: skills.basicTech,
        education: skills.education,
        systemKnowledge: skills.systemKnowledge,
        cyberTech: skills.cyberTech,
        cyberdeckDesign: skills.cyberdeckDesign,
        composition: skills.composition
      },
      funds: currentTier?.funds ?? 3000,
      homeLdl,
      housingType: kit.housingType,
      housingCost: kit.housingCost
    };

    useMeatspaceStore.getState().createCharacter(charData);
    useMeatspaceStore.setState({
      humanity: stats.emp * 10,
      maxHumanity: stats.emp * 10
    });
    if (kit.isStreet) {
      useMeatspaceStore.setState({ isStreet: true, housingType: 'street', housingCost: 0 });
    } else {
      useMeatspaceStore.getState().setHousing(kit.housingType, kit.housingCost);
    }
    const deck = useCyberdeckStore.getState();
    deck.resetDeck();
    useCyberdeckStore.getState().equipDeck(kit.deckModel, kit.mu, Math.max(1, kit.speed), kit.walls);
    for (const prog of kit.bonusPrograms) {
      const st = useCyberdeckStore.getState();
      if (st.programs.some(p => p.id === prog.id)) continue;
      if (st.usedMu + (prog.muCost ?? 1) > st.maxMu) continue;
      st.addProgram({ ...prog });
    }
    useMissionStore.getState().resetMissions();
    useRoutingStore.getState().resetRoute();
    useTerminalStore.getState().clearLogs();
    useTerminalStore.getState().addLog('> Z-TECH OS V.2.0.4 RUNNING.');
    useTerminalStore.getState().addLog('> SYSTEM READY. WAITING FOR INPUT_');
    useTerminalStore.getState().addLog(`> WELCOME TO ${(LDL_DATABASE[homeLdl]?.name ?? 'NIGHT CITY').toUpperCase()}, ${handle.toUpperCase()}.`);
    useTerminalStore.getState().addLog(`> FUNDS: ${currentTier?.funds} cr.`);
    useTerminalStore.getState().addLog(`> INT: ${stats.int} | REF: ${stats.ref} | MA: ${stats.ma} | BODY: ${stats.body}.`);

    onStart();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-black border-2 border-purple-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(168,85,247,0.4)]">
        <div className="flex justify-between items-center p-4 border-b border-purple-500">
          <h2 className="text-xl font-bold tracking-widest text-purple-400">CHARACTER CREATION</h2>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-300 text-sm">[ CLOSE ]</button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="text-purple-400 text-sm font-bold block mb-2">STREET NAME (HANDLE)</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter your street name..."
              className="w-full bg-gray-900 border border-purple-500 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              maxLength={20}
            />
          </div>

          <div className="mb-4">
            <label className="text-purple-400 text-sm font-bold block mb-2">GENETIC BASELINE (POINT POOL)</label>
            <div className="grid grid-cols-5 gap-2">
              {TIERS.map(tier => (
                <button
                  key={tier.value}
                  onClick={() => handleTierChange(tier.value)}
                  className={`p-2 border text-left transition-colors ${
                    selectedTier === tier.value
                      ? 'bg-purple-600 text-black border-purple-400'
                      : 'border-purple-500/50 text-purple-300 hover:bg-purple-500/20'
                  }`}
                >
                  <div className="font-bold text-xs">{tier.name}</div>
                  <div className="text-[10px] opacity-70">{tier.points} pts</div>
                  <div className="text-[10px] font-bold">{tier.funds} cr</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentTier?.desc}</p>
          </div>

          <div className="mb-4">
            <label className="text-purple-400 text-sm font-bold block mb-2">HOME CITY (PHYSICAL LOCATION — ALL RUNS START HERE)</label>
            <select
              value={homeLdl}
              onChange={(e) => setHomeLdl(e.target.value)}
              className="w-full bg-gray-900 border border-purple-500 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
            >
              {Object.values(LDL_DATABASE).filter(l => l.isMain && l.region === 'earth').map(l => (
                <option key={l.id} value={l.id}>{l.name}{l.isEquatorial ? ' [ORBITAL ACCESS]' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 mb-4 border-b border-purple-500/30">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-xs font-bold border transition-colors ${
                activeTab === 'stats'
                  ? 'bg-purple-500 text-black border-purple-500'
                  : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              STATS ({availableStatPoints} pts)
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 text-xs font-bold border transition-colors ${
                activeTab === 'skills'
                  ? 'bg-purple-500 text-black border-purple-500'
                  : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              SKILLS ({availableSkillPoints} pts)
            </button>
          </div>

          {activeTab === 'stats' && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">POINTS REMAINING: {availableStatPoints}</div>
              <div className="grid grid-cols-3 gap-2">
                {STAT_NAMES.map(stat => (
                  <div key={stat.key} className="flex items-center justify-between p-2 border border-purple-500/30">
                    <div>
                      <div className="text-purple-300 font-bold text-sm">{stat.name}</div>
                      <div className="text-[10px] text-gray-500">{stat.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustStat(stat.key, -1)}
                        disabled={stats[stat.key] <= 2}
                        className="w-6 h-6 bg-purple-900 text-purple-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-white font-bold w-6 text-center">{stats[stat.key]}</span>
                      <button
                        onClick={() => adjustStat(stat.key, 1)}
                        disabled={stats[stat.key] >= 10 || availableStatPoints <= 0}
                        className="w-6 h-6 bg-purple-900 text-purple-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Min: 2 | Max: 10 | Total: {pointPool} points</p>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">SKILL POINTS REMAINING: {availableSkillPoints}</div>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_NAMES.map(skill => (
                  <div key={skill.key} className="flex items-center justify-between p-2 border border-purple-500/30">
                    <div className="text-purple-300 font-bold text-sm">{skill.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustSkill(skill.key, -1)}
                        disabled={skills[skill.key] <= 1}
                        className="w-6 h-6 bg-purple-900 text-purple-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-white font-bold w-6 text-center">{skills[skill.key]}</span>
                      <button
                        onClick={() => adjustSkill(skill.key, 1)}
                        disabled={skills[skill.key] >= 10 || availableSkillPoints <= 0}
                        className="w-6 h-6 bg-purple-900 text-purple-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Starting skills based on Netrunner role. Max 10 per skill.</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-purple-500">
            <div className="text-xs text-gray-400">
              <p>TOTAL FUNDS: <span className="text-yellow-400 font-bold">{currentTier?.funds} cr</span></p>
              <p>INT: {stats.int} | REF: {stats.ref} | MA: {stats.ma} | BODY: {stats.body}</p>
            </div>
            <button
              onClick={handleBegin}
              disabled={!handle.trim() || availableStatPoints < 0 || availableSkillPoints < 0}
              className="bg-purple-600 text-black px-6 py-3 font-bold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              [ BEGIN RUN ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
