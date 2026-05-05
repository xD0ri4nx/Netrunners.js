import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMissionStore } from '../store/missionStore';
import { useRoutingStore } from '../store/routingStore';
import { useTerminalStore } from '../store/terminalStore';

const STAT_NAMES = [
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

const SKILL_NAMES = [
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
  { value: 1, name: 'Street Rat', points: 50, funds: 500, desc: '500 eb - Extreme difficulty' },
  { value: 2, name: 'Scrapper', points: 60, funds: 1500, desc: '1500 eb - Hard difficulty' },
  { value: 3, name: 'Edgerunner', points: 70, funds: 3000, desc: '3000 eb - Normal difficulty' },
  { value: 4, name: 'Corporate', points: 70, funds: 7000, desc: '7000 eb - Easy' },
  { value: 5, name: 'Trust Fund', points: 75, funds: 15000, desc: '15000 eb - Very Easy' }
];

export function CharacterCreation({ onClose, onStart }) {
  const [handle, setHandle] = useState('');
  const [selectedTier, setSelectedTier] = useState(3);
  const [pointPool, setPointPool] = useState(70);
  const [skillPoints, setSkillPoints] = useState(40);
  const [stats, setStats] = useState({
    int: 6, ref: 5, tech: 5, cool: 5, attr: 5, luck: 5, ma: 5, body: 5, emp: 8
  });
  const [skills, setSkills] = useState({
    interface: 4, awareness: 1, basicTech: 1, education: 1, systemKnowledge: 1,
    cyberTech: 1, cyberdeckDesign: 1, programming: 3, composition: 1, electronics: 1
  });
  const [activeTab, setActiveTab] = useState('stats');

  const currentTier = TIERS.find(t => t.value === selectedTier);
  const usedStatPoints = Object.values(stats).reduce((a, b) => a + b, 0);
  const availableStatPoints = pointPool - usedStatPoints;
  const usedSkillPoints = Object.values(skills).reduce((a, b) => a + b, 0);
  const availableSkillPoints = 40 - usedSkillPoints;

  const adjustStat = (statKey, delta) => {
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

  const adjustSkill = (skillKey, delta) => {
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

  const handleTierChange = (tierValue) => {
    const tier = TIERS.find(t => t.value === tierValue);
    setSelectedTier(tierValue);
    setPointPool(tier.points);
  };

  const handleBegin = () => {
    if (!handle.trim()) {
      alert('Please enter a street name (Handle)');
      return;
    }

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
      funds: currentTier.funds
    };

    useMeatspaceStore.getState().createCharacter(charData);
    useMeatspaceStore.setState({ 
      humanity: stats.emp * 10, 
      maxHumanity: stats.emp * 10 
    });
    useCyberdeckStore.getState().resetDeck();
    useMissionStore.getState().resetMissions();
    useRoutingStore.getState().resetRoute();
    useTerminalStore.getState().clearLogs();
    useTerminalStore.getState().addLog('> ZETATECH OS V.2.0.4 RUNNING.');
    useTerminalStore.getState().addLog('> SYSTEM READY. WAITING FOR INPUT_');
    useTerminalStore.getState().addLog(`> WELCOME TO NIGHT CITY, ${handle.toUpperCase()}.`);
    useTerminalStore.getState().addLog(`> FUNDS: ${currentTier.funds} eb.`);
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
                  <div className="text-[10px] font-bold">{tier.funds} eb</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentTier?.desc}</p>
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
              <p>TOTAL FUNDS: <span className="text-yellow-400 font-bold">{currentTier?.funds} eb</span></p>
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