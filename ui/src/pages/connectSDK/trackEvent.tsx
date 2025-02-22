import { useState, useEffect, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import ProjectLayout from 'layout/projectLayout';
import Loading from 'components/Loading';
import SelectSDK from './components/SelectSDK';
import TrackEvent from './components/TrackEvent';
import TestConnection from './components/TestConnection';
import { ToggleReturnType, SdkLanguage, SDK_VERSION, SDK_TYPES } from './constants';
import { saveDictionary, getFromDictionary } from 'services/dictionary';
import { getToggleInfo, getToggleAttributes, getToggleTrackEvent } from 'services/toggle';
import { getProjectInfo, getEnvironment } from 'services/project';
import { getEventDetail } from 'services/analysis';
import { getSdkVersion } from 'services/misc';
import { IDictionary, IToggleInfo } from 'interfaces/targeting';
import { IProject, IEnvironment, IRouterParams } from 'interfaces/project';
import { IEvent } from 'interfaces/analysis';
import { CLICK, CUSTOM, PAGE_VIEW } from 'pages/analysis/constants';

import styles from './index.module.scss';

interface IStep {
  [x: string]: {
    done: boolean;
    projectKey?: string;
    environmentKey?: string;
    toggleKey?: string;
    sdk?: string;
  };
}


interface IReport {
  isReport: boolean;
}

const step: IStep = {
  step1: {
    done: true,
    sdk: 'Java',
  },
  step2: {
    done: false,
  },
  step3: {
    done: false,
  },
  step4: {
    done: false,
  }
};

const PREFIX = 'access_event_';
const FIRST = 1;
const SECOND = 2;
const THIRD = 3;

const AccessEvent = () => {
  const [ currentStep, saveCurrentStep ] = useState<number>(SECOND);
  const [ currentSDK, saveCurrentSDK ] = useState<SdkLanguage>('Java');
  const [ serverSdkKey, saveServerSDKKey ] = useState<string>('');
  const [ clientSdkKey, saveClientSdkKey ] = useState<string>('');
  const [ sdkVersion, saveSDKVersion ] = useState<string>('');
  const [ returnType, saveReturnType ] = useState<ToggleReturnType>('');
  const [ isReport, saveIsReport ] = useState<boolean>(false);
  const [ projectName, saveProjectName ] = useState<string>('');
  const [ environmentName, saveEnvironmentName ] = useState<string>('');
  const [ isTrackLoading, saveTrackLoading ] = useState<boolean>(false);
  const [ isInfoLoading, saveIsInfoLoading ] = useState<boolean>(true);
  const [ isStepLoading, saveIsStepLoading ] = useState<boolean>(true);
  const [ clientAvailability, saveClientAvailability ] = useState<boolean>(false);
  const [ attributes, saveAttributes ] = useState<string[]>([]);
  const [ eventInfo, saveEventInfo ] = useState<IEvent>();
  const { projectKey, environmentKey, toggleKey } = useParams<IRouterParams>();

  const KEY = PREFIX + projectKey + '_' + environmentKey + '_' + toggleKey;

  const init = useCallback(async() => {
    Promise.all([
      getFromDictionary<IDictionary>(KEY), 
      getToggleAttributes<string[]>(projectKey, environmentKey, toggleKey),
      getEventDetail<IEvent>(projectKey, environmentKey, toggleKey)
    ]).then(res => {
      saveIsStepLoading(false);
      if (res[0].success && res[0].data) {
        const savedData = JSON.parse(res[0].data.value);

        if (savedData.step3.done) {
          saveCurrentStep(THIRD);
          saveCurrentSDK(savedData.step1.sdk);
        } else if (savedData.step2.done) {
          saveCurrentStep(THIRD);
          saveCurrentSDK(savedData.step1.sdk);
        } else if (savedData.step1.done) {
          saveCurrentStep(SECOND);
          saveCurrentSDK(savedData.step1.sdk);
        }
      } else {
        saveCurrentStep(1);
      }

      if (res[1].success && res[1].data) {
        saveAttributes(res[1].data);
      }

      if (res[2].success && res[2].data) {
        saveEventInfo(res[2].data);
      }
    });

    Promise.all([
      getProjectInfo<IProject>(projectKey), 
      getEnvironment<IEnvironment>(projectKey, environmentKey), 
      getToggleInfo<IToggleInfo>(projectKey, environmentKey, toggleKey)
    ]).then(res => {
      saveIsInfoLoading(false);
      
      if (res[0].success && res[0].data) {
        saveProjectName(res[0].data.name);
      }

      if (res[1].success &&  res[1].data) {
        saveServerSDKKey(res[1].data.serverSdkKey);
        saveClientSdkKey(res[1].data.clientSdkKey);
        saveEnvironmentName(res[1].data.name);
      }

      if (res[2].success && res[2].data) {
        saveReturnType(res[2].data.returnType as ToggleReturnType);
        saveClientAvailability(res[2].data.clientAvailability);
      }
    });
  }, [KEY, environmentKey, projectKey, toggleKey]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (eventInfo?.eventType === PAGE_VIEW || eventInfo?.eventName === CLICK) {
      if (currentSDK !== 'JavaScript' && currentSDK !== 'React') {
        saveCurrentSDK('JavaScript');
        saveCurrentStep(FIRST);
      }
    }
  }, [eventInfo, currentSDK]);

  useEffect(() => {
    if (currentSDK) {
      const key = SDK_VERSION.get(currentSDK);

      if (key) {
        getSdkVersion<string>(key).then(res => {
          const { success, data } = res;
          if (success && data) {
            saveSDKVersion(data);
          }
        });
      }
    }
  }, [currentSDK]);

  const checkStatus = useCallback(() => {
    getToggleTrackEvent<IReport>(projectKey, environmentKey, toggleKey, SDK_TYPES.get(currentSDK)).then(res => {
      const { data, success } = res;
      if (success && data) {
        saveIsReport(data.isReport);
      }
    });
  }, [projectKey, environmentKey, toggleKey, currentSDK]);

  useEffect(() => {
    if(currentStep === THIRD) {
      saveTrackLoading(true);
      checkStatus();
    }
  }, [currentStep, checkStatus]);

  const saveFirstStep = useCallback((sdk: string) => {
    step.step1.done = true;
    step.step1.sdk = sdk;
    saveDictionary(KEY, step).then(res => {
      if (res.success) {
        saveCurrentStep(currentStep + 1);
      }
    });
  }, [KEY, currentStep]);

  const saveSecondStep = useCallback(() => {
    step.step2.done = true;
    step.step1.sdk = currentSDK;
    saveDictionary(KEY, step).then(res => {
      if (res.success) {
        saveCurrentStep(currentStep + 1);
      }
    });
  }, [currentSDK, KEY, currentStep]);

  const goBackToStep = useCallback((currentStep: number) => {
    saveCurrentStep(currentStep);
    if (currentStep === FIRST) {
      step.step2.done = false;
      step.step3.done = false;
    }

    if (currentStep === SECOND) {
      step.step3.done = false;
    }
  }, []);

  return (
    <ProjectLayout>
      <div className={styles['connect-sdk']}>
        <div className={styles.intro}>
          {
            isInfoLoading ? <Loading /> : (
              <div>
                <div className={styles['intro-header']}>
                  <span className={styles['intro-title']}>
                    <FormattedMessage id='common.event.track.text' />
                  </span>
                </div>
                <div className={styles['intro-desc']}>
                  <FormattedMessage id='connect.track.description' />
                </div>
                <div className={styles['intro-info']}>
                  <div className={styles['card-item']}>
                    <div className={styles['card-title']}>
                      <FormattedMessage id='common.project.text' /> :
                    </div>
                    <div className={styles['card-value']}>
                      { projectName }
                    </div>
                  </div>
                  <div className={styles['card-item']}>
                    <div className={styles['card-title']}>
                      <FormattedMessage id='common.environment.text' /> :
                    </div>
                    <div className={styles['card-value']}>
                      { environmentName }
                    </div>
                  </div>
                  <div className={styles['card-item']}>
                    <div className={styles['card-title']}>
                      <FormattedMessage id='common.event.uppercase.text' /> :
                    </div>
                    <div className={styles['card-value']}>
                      {
                        eventInfo?.eventType == CUSTOM && (
                          <span>
                            <FormattedMessage id='analysis.event.custom' />
                            -
                            { eventInfo?.eventName }
                          </span>
                        )
                      }
                      { eventInfo?.eventType == PAGE_VIEW && <FormattedMessage id='analysis.event.pageview' /> }
                      { eventInfo?.eventType == CLICK && <FormattedMessage id='analysis.event.click' /> }
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
        <div className={styles.steps}>
          {
            isStepLoading ? <Loading /> : (
              <>
                <SelectSDK 
                  currentStep={currentStep}
                  currentSDK={currentSDK}
                  clientAvailability={clientAvailability}
                  isTrackEvent={true}
                  eventInfo={eventInfo}
                  saveStep={saveFirstStep}
                  saveCurrentSDK={saveCurrentSDK}
                  goBackToStep={goBackToStep}
                />

                <TrackEvent 
                  attributes={attributes}
                  currentStep={currentStep}
                  currentSDK={currentSDK}
                  returnType={returnType}
                  serverSdkKey={serverSdkKey}
                  clientSdkKey={clientSdkKey}
                  sdkVersion={sdkVersion}
                  eventInfo={eventInfo}
                  saveStep={saveSecondStep}
                  goBackToStep={goBackToStep}
                />
                  
                <TestConnection 
                 isLoading={isTrackLoading}
                 projectKey={projectKey}
                 environmentKey={environmentKey}
                 toggleKey={toggleKey}
                 currentStep={currentStep}
                 isConnected={isReport}
                 isTrackEvent={true}
                 eventInfo={eventInfo}
                 saveIsLoading={saveTrackLoading}
                 checkStatus={checkStatus}
                />
              </>
            )
          }
        </div>
      </div>
    </ProjectLayout>
  );
};

export default AccessEvent;
