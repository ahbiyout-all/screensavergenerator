export type ScrTemplateType = 
  | 'matrix' 
  | 'starfield' 
  | 'clock' 
  | 'neon_waves' 
  | 'bouncing';

export interface ScrMakerConfig {
  template: ScrTemplateType;
  title: string;
  outputName: string;
  
  // Matrix options
  matrixCharColor: string;
  matrixSpeed: number;
  matrixCharSize: number;
  matrixCustomText: string;

  // Starfield options
  starCount: number;
  starSpeed: number;
  starColor: string;
  starWarpEffect: boolean;

  // Clock options
  clockFormat24h: boolean;
  clockShowSeconds: boolean;
  clockShowDate: boolean;
  clockFontColor: string;
  clockFontSize: number;
  clockCustomMessage: string;

  // Neon Waves
  waveColor1: string;
  waveColor2: string;
  waveSpeed: number;
  waveCount: number;

  // Bouncing Logo/Text
  bouncingText: string;
  bouncingTextColor: string;
  bouncingSpeed: number;
  bouncingSize: number;
  
  // General & Multi-Monitor options
  exitOnMouseMove: boolean;
  exitOnKeyPress: boolean;
  targetFramework: 'net48' | 'netcore' | 'c_win32';
  multiMonitorMode: 'all_screens' | 'primary_active_black_secondary';
}

export const DEFAULT_SCR_CONFIG: ScrMakerConfig = {
  template: 'matrix',
  title: 'My Custom Screensaver',
  outputName: 'MyScreensaver',
  
  matrixCharColor: '#00FF66',
  matrixSpeed: 5,
  matrixCharSize: 18,
  matrixCustomText: 'MATRIX 0123456789 ABCDEF GHIJKL MNOPQR STUVWX YZ',

  starCount: 300,
  starSpeed: 6,
  starColor: '#60A5FA',
  starWarpEffect: true,

  clockFormat24h: true,
  clockShowSeconds: true,
  clockShowDate: true,
  clockFontColor: '#F8FAFC',
  clockFontSize: 64,
  clockCustomMessage: 'Have a productive day!',

  waveColor1: '#8B5CF6',
  waveColor2: '#EC4899',
  waveSpeed: 4,
  waveCount: 5,

  bouncingText: 'WINDOWS .SCR',
  bouncingTextColor: '#38BDF8',
  bouncingSpeed: 5,
  bouncingSize: 36,

  exitOnMouseMove: true,
  exitOnKeyPress: true,
  targetFramework: 'net48',
  multiMonitorMode: 'all_screens'
};
