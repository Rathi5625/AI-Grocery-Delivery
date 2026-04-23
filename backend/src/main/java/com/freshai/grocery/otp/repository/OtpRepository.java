package com.freshai.grocery.otp.repository;

import com.freshai.grocery.otp.entity.OtpVerification;
import com.freshai.grocery.otp.entity.OtpVerification.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    /** Latest unverified OTP for a user + purpose — used for verification */
    Optional<OtpVerification> findTopByUserIdAndOtpPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(
            Long userId, OtpPurpose purpose);

    /** Rate-limit check: count OTPs for this user + purpose in the last timeWindow */
    @Query("SELECT COUNT(o) FROM OtpVerification o " +
           "WHERE o.userId = :userId AND o.otpPurpose = :purpose AND o.createdAt > :since")
    long countRecentOtpRequests(
            @Param("userId")  Long userId,
            @Param("purpose") OtpPurpose purpose,
            @Param("since")   LocalDateTime since);

    /** Mark a specific OTP as verified */
    @Modifying
    @Query("UPDATE OtpVerification o SET o.isVerified = true WHERE o.otpId = :otpId")
    void markVerified(@Param("otpId") Long otpId);

    /**
     * Invalidate (mark verified) all active OTPs for a user + purpose before issuing a new one.
     * Prevents a user from having multiple simultaneous active OTPs.
     */
    @Modifying
    @Query("UPDATE OtpVerification o SET o.isVerified = true " +
           "WHERE o.userId = :userId AND o.otpPurpose = :purpose AND o.isVerified = false")
    void invalidateActiveOtps(
            @Param("userId")  Long userId,
            @Param("purpose") OtpPurpose purpose);

    List<OtpVerification> findByOtpCodeAndIsVerifiedFalse(String otpCode);

    /**
     * Delete expired OTPs — called by scheduled cleanup job.
     * Returns the number of rows deleted for logging.
     */
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiryTime < :now")
    int deleteExpiredOtps(@Param("now") LocalDateTime now);
}
