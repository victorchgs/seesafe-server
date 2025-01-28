import numpy as np
from scipy.stats import kurtosis, skew

def get_features(acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, interval=6):
    acc_x_linear = acc_x - np.mean(acc_x)
    acc_y_linear = acc_y - np.mean(acc_y)
    acc_z_linear = acc_z - np.mean(acc_z)
    linear_acc_magnitude = np.sqrt(acc_x_linear**2 + acc_y_linear**2 + acc_z_linear**2)

    gyro_magnitude = np.sqrt(gyro_x**2 + gyro_y**2 + gyro_z**2)

    features = []

    for start in range(0, len(linear_acc_magnitude), interval):
        end = start + interval

        acc_mag_segment = linear_acc_magnitude[start:end]
        gyro_mag_segment = gyro_magnitude[start:end]

        if len(acc_mag_segment) == 0 or len(gyro_mag_segment) == 0:
            continue  

        acc_max = np.max(acc_mag_segment)
        gyro_max = np.max(gyro_mag_segment)
        acc_kurtosis = kurtosis(acc_mag_segment, fisher=True, bias=False) if len(acc_mag_segment) > 1 else 0
        gyro_kurtosis = kurtosis(gyro_mag_segment, fisher=True, bias=False) if len(gyro_mag_segment) > 1 else 0
        acc_skewness = skew(acc_mag_segment, bias=False) if len(acc_mag_segment) > 1 else 0
        gyro_skewness = skew(gyro_mag_segment, bias=False) if len(gyro_mag_segment) > 1 else 0

        segment_fraction = max(1, len(acc_mag_segment) // 5)
        post_lin_max = np.max(acc_mag_segment[-segment_fraction:]) if segment_fraction > 0 else 0
        post_gyro_max = np.max(gyro_mag_segment[-segment_fraction:]) if segment_fraction > 0 else 0

        features.append([
            acc_max,
            gyro_max,
            acc_kurtosis,
            gyro_kurtosis,
            acc_skewness,
            gyro_skewness,
            np.max(acc_mag_segment),  # linear acc max
            post_lin_max,
            post_gyro_max
        ])

    return np.array(features)
