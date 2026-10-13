package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.auth.dto.GoogleTokenPayload;

public interface GoogleTokenVerifier {

    GoogleTokenPayload verify(String idToken);
}
