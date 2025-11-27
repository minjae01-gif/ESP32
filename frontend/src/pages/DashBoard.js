import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Progress, Button, message } from 'antd';
import { 
  ThunderboltOutlined, 
  CloudOutlined,
  BulbOutlined,
  DropboxOutlined,
  BulbFilled,
  ExperimentOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { sensorAPI } from '../services/api';

const { Title, Text } = Typography;

// 커스텀 게이지 컴포넌트
const CustomGauge = ({ value, max, title, icon, unit, levels }) => {
  const percentage = (value / max) * 100;
  
  // 현재 레벨 찾기
  const currentLevel = levels.find(level => 
    percentage >= level.min && percentage <= level.max
  );

  return (
    <div style={styles.gaugeContainer}>
      <div style={styles.gaugeHeader}>
        {icon}
        <Title level={4} style={{ margin: '8px 0' }}>{title}</Title>
      </div>

      {/* 반원형 게이지 */}
      <div style={styles.semicircleWrapper}>
        <svg width="300" height="180" viewBox="0 0 300 180">
          {/* 배경 아크들 (3단계) */}
          {levels.map((level, index) => {
            const startAngle = 180 + (level.min * 1.8);
            const endAngle = 180 + (level.max * 1.8);
            const radius = 120;
            const cx = 150;
            const cy = 150;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);

            const largeArc = endAngle - startAngle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={level.color}
                strokeWidth="25"
                strokeLinecap="round"
                opacity="0.3"
              />
            );
          })}

          {/* 활성 아크 (현재 값) */}
          {(() => {
            const angle = 180 + (percentage * 1.8);
            const radius = 120;
            const cx = 150;
            const cy = 150;

            const startRad = (180 * Math.PI) / 180;
            const endRad = (angle * Math.PI) / 180;

            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);

            const largeArc = angle - 180 > 180 ? 1 : 0;

            return (
              <path
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={currentLevel?.color || '#52c41a'}
                strokeWidth="25"
                strokeLinecap="round"
              />
            );
          })()}

          {/* 바늘 */}
          {(() => {
            const angle = 180 + (percentage * 1.8);
            const needleLength = 100;
            const cx = 150;
            const cy = 150;
            const rad = (angle * Math.PI) / 180;
            const x = cx + needleLength * Math.cos(rad);
            const y = cy + needleLength * Math.sin(rad);

            return (
              <g>
                <circle cx={cx} cy={cy} r="8" fill="#595959" />
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#595959"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            );
          })()}

          {/* 숫자 표시 */}
          <text
            x="150"
            y="120"
            textAnchor="middle"
            style={{
              fontSize: '42px',
              fontWeight: 'bold',
              fill: currentLevel?.color || '#262626',
            }}
          >
            {value}
          </text>
          <text
            x="150"
            y="170"
            textAnchor="middle"
            style={{
              fontSize: '16px',
              fill: '#8c8c8c',
            }}
          >
            {unit}
          </text>
        </svg>
      </div>

      {/* 상태 태그 */}
      <div style={styles.statusContainer}>
        <Tag color={currentLevel?.color} style={styles.statusTag}>
          {currentLevel?.label}
        </Tag>
      </div>

      {/* 범례 */}
      <div style={styles.legendContainer}>
        <Space size="small" wrap>
          {levels.map((level, index) => (
            <div key={index} style={styles.legend}>
              <div style={{ ...styles.legendDot, background: level.color }}></div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {level.label} ({level.range || `${level.min}-${level.max}`})
              </Text>
            </div>
          ))}
        </Space>
      </div>
    </div>
  );
};

function DashBoard() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightLevel: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // ⭐ 제어 상태 추가
  const [ledStatus, setLedStatus] = useState(false);
  const [motorStatus, setMotorStatus] = useState(false);
  const [controlLoading, setControlLoading] = useState(false);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await sensorAPI.getLatestData();
      if (response.data.success && response.data.data) {
        setSensorData(response.data.data);
      }
    } catch (error) {
      console.error('센서 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ LED 제어 함수
  const handleLedControl = async () => {
    setControlLoading(true);
    try {
      const command = ledStatus ? 'led_off' : 'led_on';
      const response = await sensorAPI.sendCommand(command);
      
      if (response.data.success) {
        setLedStatus(!ledStatus);
        message.success(ledStatus ? '💡 LED 꺼짐' : '💡 LED 켜짐');
      }
    } catch (error) {
      console.error('LED 제어 실패:', error);
      message.error('LED 제어에 실패했습니다');
    } finally {
      setControlLoading(false);
    }
  };

  // ⭐ 워터펌프 제어 함수
  const handleMotorControl = async () => {
    setControlLoading(true);
    try {
      const command = motorStatus ? 'motor_off' : 'motor_on';
      const response = await sensorAPI.sendCommand(command);
      
      if (response.data.success) {
        setMotorStatus(!motorStatus);
        message.success(motorStatus ? '🚿 워터펌프 정지' : '🚿 워터펌프 작동');
      }
    } catch (error) {
      console.error('워터펌프 제어 실패:', error);
      message.error('워터펌프 제어에 실패했습니다');
    } finally {
      setControlLoading(false);
    }
  };

  // 토양습도 레벨 정의
  const soilLevels = [
    { min: 0, max: 29, color: '#ff4d4f', label: '건조함' },
    { min: 30, max: 59, color: '#faad14', label: '적당함' },
    { min: 60, max: 100, color: '#52c41a', label: '습함' },
  ];

  // 조도 레벨 정의 (0-10을 0-100%로 변환)
  const lightLevels = [
    { min: 0, max: 20, color: '#8c8c8c', label: '어두움', range: '0-2' },
    { min: 30, max: 60, color: '#faad14', label: '적당함', range: '3-6' },
    { min: 70, max: 100, color: '#52c41a', label: '밝음', range: '7-10' },
  ];

  return (
    <Layout>
      <div style={styles.container}>
        <Title level={2}>🌱 실시간 센서 대시보드</Title>
        <Text type="secondary">IoT 센서 데이터 모니터링 & 제어</Text>

        <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
          {/* 토양습도 게이지 */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card loading={loading} style={styles.gaugeCard} hoverable>
              <CustomGauge
                value={sensorData.soilMoisture}
                max={100}
                title="토양습도"
                icon={<DropboxOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                unit="%"
                levels={soilLevels}
              />
            </Card>
          </Col>

          {/* 조도 게이지 */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card loading={loading} style={styles.gaugeCard} hoverable>
              <CustomGauge
                value={sensorData.lightLevel}
                max={10}
                title="조도"
                icon={<BulbOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                unit="/ 10"
                levels={lightLevels}
              />
            </Card>
          </Col>

          {/* 온도 */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <Card loading={loading} style={styles.smallCard} hoverable>
              <div style={styles.smallCardContent}>
                <ThunderboltOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                <Title level={3} style={{ margin: '8px 0', color: '#ff4d4f' }}>
                  {sensorData.temperature}°C
                </Title>
                <Text type="secondary">온도</Text>
              </div>
            </Card>
          </Col>

          {/* 습도 */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <Card loading={loading} style={styles.smallCard} hoverable>
              <div style={styles.smallCardContent}>
                <CloudOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                <Title level={3} style={{ margin: '8px 0', color: '#1890ff' }}>
                  {sensorData.humidity}%
                </Title>
                <Text type="secondary">습도</Text>
              </div>
            </Card>
          </Col>

          {/* ⭐ LED 제어 카드 */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <Card style={styles.controlCard} hoverable>
              <div style={styles.controlContent}>
                <BulbFilled 
                  style={{ 
                    fontSize: '48px', 
                    color: ledStatus ? '#faad14' : '#d9d9d9',
                    transition: 'all 0.3s ease'
                  }} 
                />
                <Title level={4} style={{ margin: '12px 0 8px' }}>LED 조명</Title>
                <Tag color={ledStatus ? 'gold' : 'default'} style={{ marginBottom: '16px' }}>
                  {ledStatus ? '켜짐' : '꺼짐'}
                </Tag>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={controlLoading}
                  onClick={handleLedControl}
                  style={{
                    background: ledStatus ? '#faad14' : '#52c41a',
                    borderColor: ledStatus ? '#faad14' : '#52c41a',
                  }}
                >
                  {ledStatus ? 'LED 끄기' : 'LED 켜기'}
                </Button>
              </div>
            </Card>
          </Col>

          {/* ⭐ 워터펌프 제어 카드 */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <Card style={styles.controlCard} hoverable>
              <div style={styles.controlContent}>
                <ExperimentOutlined 
                  style={{ 
                    fontSize: '48px', 
                    color: motorStatus ? '#1890ff' : '#d9d9d9',
                    transition: 'all 0.3s ease'
                  }} 
                />
                <Title level={4} style={{ margin: '12px 0 8px' }}>워터펌프</Title>
                <Tag color={motorStatus ? 'blue' : 'default'} style={{ marginBottom: '16px' }}>
                  {motorStatus ? '작동중' : '정지'}
                </Tag>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={controlLoading}
                  onClick={handleMotorControl}
                  danger={motorStatus}
                  style={{
                    background: motorStatus ? '#ff4d4f' : '#1890ff',
                    borderColor: motorStatus ? '#ff4d4f' : '#1890ff',
                  }}
                >
                  {motorStatus ? '펌프 정지' : '펌프 작동'}
                </Button>
              </div>
            </Card>
          </Col>

          {/* 상태 요약 */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card style={styles.summaryCard}>
              <Title level={4}>💡 현재 상태 요약</Title>
              <div style={styles.summaryContent}>
                {sensorData.soilMoisture < 30 && (
                  <Tag color="red" style={styles.alertTag}>
                    ⚠️ 토양이 건조합니다. 물을 주세요!
                  </Tag>
                )}
                {sensorData.lightLevel < 3 && (
                  <Tag color="orange" style={styles.alertTag}>
                    💡 조도가 낮습니다. 밝은 곳으로 이동하세요!
                  </Tag>
                )}
                {sensorData.soilMoisture >= 30 && sensorData.lightLevel >= 3 && (
                  <Tag color="green" style={styles.alertTag}>
                    ✅ 모든 센서 값이 정상 범위입니다!
                  </Tag>
                )}
                
                {/* 제어 상태 표시 */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Tag icon={<BulbFilled />} color={ledStatus ? 'gold' : 'default'}>
                    LED: {ledStatus ? 'ON' : 'OFF'}
                  </Tag>
                  <Tag icon={<ExperimentOutlined />} color={motorStatus ? 'blue' : 'default'}>
                    워터펌프: {motorStatus ? 'ON' : 'OFF'}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    padding: '24px',
  },
  gaugeCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    padding: '24px',
  },
  gaugeContainer: {
    width: '100%',
  },
  gaugeHeader: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  semicircleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    textAlign: 'center',
    marginTop: '16px',
  },
  statusTag: {
    fontSize: '16px',
    padding: '8px 24px',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  smallCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  smallCardContent: {
    textAlign: 'center',
    padding: '24px',
  },
  // ⭐ 제어 카드 스타일 추가
  controlCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  controlContent: {
    textAlign: 'center',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '12px',
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  alertTag: {
    fontSize: '14px',
    padding: '12px 20px',
    borderRadius: '8px',
    display: 'inline-block',
  },
};

export default DashBoard;